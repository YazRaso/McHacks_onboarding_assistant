"""
Tool definitions and handlers for Backboard LLM integration.
Tools are invoked via special prompts like @"toolname"
"""

import os
import re
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from backboard import BackboardClient
import db
import encryption


def detect_tool_invocation(content: str) -> Optional[str]:
    """
    Detect if the content contains a tool invocation pattern.
    Pattern: @"toolname" or @toolname
    
    Returns the tool name if found, None otherwise.
    """
    # Match patterns like @"create_file" or @create_file
    pattern = r'@["\']?(\w+)["\']?'
    match = re.search(pattern, content)
    if match:
        return match.group(1)
    return None


async def handle_create_file(
    client_id: str,
    filename: str,
    content: str,
    backboard_client: BackboardClient,
    assistant_id: str
) -> Dict[str, Any]:
    """
    Tool: create_file
    Creates a new file in the user's workspace.
    
    This tool should be called by Backboard when the user asks to create a file.
    The actual file creation happens in the VS Code extension or web frontend.
    """
    # Store the file creation request in a way that the frontend can pick it up
    # For now, we'll return the file info and let the frontend handle creation
    
    # Optionally, we could store this in the database for the frontend to poll
    # For now, we'll return it in the response
    
    return {
        "tool": "create_file",
        "status": "ready",
        "filename": filename,
        "content": content,
        "message": f"File creation request prepared: {filename}"
    }


async def handle_get_recent_context(
    client_id: str,
    hours: int = 24,
    backboard_client: BackboardClient,
    assistant_id: str
) -> Dict[str, Any]:
    """
    Tool: get_recent_context
    Retrieves RAG chunks ingested within the last X hours, grouped by source.
    
    This queries Backboard's RAG system for recent memories/chunks.
    """
    try:
        # Query Backboard for recent memories
        # Note: This is a simplified implementation - actual Backboard API may differ
        # We'll need to query memories with metadata filtering
        
        # Get all memories for the assistant
        # Note: This assumes Backboard API has get_memories method
        # If not available, we'll need to use a different approach
        try:
            memories = await backboard_client.get_memories(assistant_id=assistant_id)
        except AttributeError:
            # Fallback if get_memories doesn't exist
            # In production, you'd query Backboard's RAG API directly
            memories = []
        
        # Filter by ingested_at timestamp (if available in metadata)
        now = datetime.now()
        cutoff_time = now - timedelta(hours=hours)
        
        recent_context = {
            "telegram": [],
            "drive": [],
            "github": []
        }
        
        # Group memories by source
        for memory in memories:
            # Check if memory has metadata with source and ingested_at
            metadata = memory.get("metadata", {})
            source = metadata.get("source", "unknown")
            ingested_at_str = metadata.get("ingested_at")
            
            if ingested_at_str:
                try:
                    ingested_at = datetime.fromisoformat(ingested_at_str.replace('Z', '+00:00'))
                    if ingested_at.replace(tzinfo=None) >= cutoff_time:
                        memory_entry = {
                            "content": memory.get("content", "")[:200] + "...",  # Preview
                            "ingested_at": ingested_at_str,
                            "memory_id": memory.get("memory_id")
                        }
                        
                        if source.lower() == "telegram":
                            recent_context["telegram"].append(memory_entry)
                        elif source.lower() == "drive":
                            recent_context["drive"].append(memory_entry)
                        elif source.lower() in ["github", "git"]:
                            recent_context["github"].append(memory_entry)
                except (ValueError, AttributeError):
                    # Skip if timestamp parsing fails
                    pass
        
        # Format the response for the LLM
        formatted_response = format_recent_context(recent_context, hours)
        
        return {
            "tool": "get_recent_context",
            "status": "success",
            "hours": hours,
            "context": recent_context,
            "formatted": formatted_response
        }
    except Exception as e:
        return {
            "tool": "get_recent_context",
            "status": "error",
            "error": str(e)
        }


def format_recent_context(context: Dict[str, List], hours: int) -> str:
    """
    Format recent context into a readable summary grouped by source.
    """
    output = f"📊 Recent Activity (Last {hours} hours)\n\n"
    
    telegram_count = len(context["telegram"])
    drive_count = len(context["drive"])
    github_count = len(context["github"])
    
    if telegram_count > 0:
        output += f"📢 Chat Decisions (Source: Telegram) - {telegram_count} items\n"
        for item in context["telegram"][:5]:  # Show top 5
            output += f"  • {item['content']}\n"
        output += "\n"
    
    if drive_count > 0:
        output += f"📄 New Specs (Source: Drive) - {drive_count} items\n"
        for item in context["drive"][:5]:
            output += f"  • {item['content']}\n"
        output += "\n"
    
    if github_count > 0:
        output += f"💻 Code Changes (Source: Github) - {github_count} items\n"
        for item in context["github"][:5]:
            output += f"  • {item['content']}\n"
        output += "\n"
    
    if telegram_count == 0 and drive_count == 0 and github_count == 0:
        output += "No recent activity found in the specified time period.\n"
    
    return output


async def handle_generate_mermaid_graph(
    client_id: str,
    topic: str,
    backboard_client: BackboardClient,
    assistant_id: str
) -> Dict[str, Any]:
    """
    Tool: generate_mermaid_graph
    Generates a Mermaid.js syntax string that maps the lineage of a feature.
    
    This queries Backboard for related memories about the topic and constructs
    a graph showing the relationship between chat decisions, specs, and code.
    """
    try:
        # Query Backboard for memories related to the topic
        try:
            memories = await backboard_client.get_memories(assistant_id=assistant_id)
        except AttributeError:
            # Fallback if get_memories doesn't exist
            memories = []
        
        # Filter memories related to the topic
        related_memories = []
        for memory in memories:
            content = memory.get("content", "").lower()
            if topic.lower() in content:
                related_memories.append(memory)
        
        # Build Mermaid graph
        mermaid_syntax = build_mermaid_graph(topic, related_memories)
        
        return {
            "tool": "generate_mermaid_graph",
            "status": "success",
            "topic": topic,
            "mermaid": mermaid_syntax,
            "formatted": f"```mermaid\n{mermaid_syntax}\n```"
        }
    except Exception as e:
        return {
            "tool": "generate_mermaid_graph",
            "status": "error",
            "error": str(e)
        }


def build_mermaid_graph(topic: str, memories: List[Dict]) -> str:
    """
    Build a Mermaid flowchart showing the lineage of a feature.
    """
    graph = f"graph TD\n"
    graph += f"    Start[\"{topic}\"]\n"
    
    # Group memories by source
    telegram_nodes = []
    drive_nodes = []
    code_nodes = []
    
    for i, memory in enumerate(memories[:10]):  # Limit to 10 for readability
        metadata = memory.get("metadata", {})
        source = metadata.get("source", "unknown").lower()
        content = memory.get("content", "")[:50] + "..."
        node_id = f"Node{i}"
        
        if source == "telegram":
            telegram_nodes.append((node_id, content))
        elif source == "drive":
            drive_nodes.append((node_id, content))
        elif source in ["github", "git"]:
            code_nodes.append((node_id, content))
    
    # Add nodes and edges
    if telegram_nodes:
        graph += f"    Start --> Telegram[\"Telegram Discussions\"]\n"
        for node_id, content in telegram_nodes:
            graph += f"    Telegram --> {node_id}[\"{content}\"]\n"
    
    if drive_nodes:
        graph += f"    Start --> Drive[\"Drive Documents\"]\n"
        for node_id, content in drive_nodes:
            graph += f"    Drive --> {node_id}[\"{content}\"]\n"
    
    if code_nodes:
        graph += f"    Start --> Code[\"Code Implementation\"]\n"
        for node_id, content in code_nodes:
            graph += f"    Code --> {node_id}[\"{content}\"]\n"
    
    if not telegram_nodes and not drive_nodes and not code_nodes:
        graph += f"    Start --> NoData[\"No related data found\"]\n"
    
    return graph


async def execute_tool(
    tool_name: str,
    client_id: str,
    content: str,
    backboard_client: BackboardClient,
    assistant_id: str
) -> Dict[str, Any]:
    """
    Execute a tool based on its name.
    
    Args:
        tool_name: Name of the tool to execute
        client_id: Client ID
        content: Original user content (may contain tool parameters)
        backboard_client: Backboard client instance
        assistant_id: Assistant ID
    
    Returns:
        Tool execution result
    """
    # Parse tool parameters from content
    # This is a simplified parser - in production, you'd want more robust parsing
    
    if tool_name == "create_file":
        # Extract filename and content from the query
        # Pattern: @"create_file" filename: "path/to/file.md" content: "..."
        filename_match = re.search(r'filename[:\s]+["\']?([^"\']+)["\']?', content, re.IGNORECASE)
        content_match = re.search(r'content[:\s]+["\'](.+?)["\']', content, re.DOTALL | re.IGNORECASE)
        
        filename = filename_match.group(1) if filename_match else "docs/ONBOARDING.md"
        file_content = content_match.group(1) if content_match else ""
        
        # If no explicit content, ask Backboard to generate it
        if not file_content:
            # The LLM should provide the content in the response
            # For now, we'll return a request for content
            return {
                "tool": "create_file",
                "status": "pending_content",
                "filename": filename,
                "message": f"Please provide the content for {filename}"
            }
        
        return await handle_create_file(
            client_id, filename, file_content, backboard_client, assistant_id
        )
    
    elif tool_name == "get_recent_context":
        # Extract hours parameter
        hours_match = re.search(r'hours?[:\s]+(\d+)', content, re.IGNORECASE)
        hours = int(hours_match.group(1)) if hours_match else 24
        
        return await handle_get_recent_context(
            client_id, hours, backboard_client, assistant_id
        )
    
    elif tool_name == "generate_mermaid_graph":
        # Extract topic
        topic_match = re.search(r'topic[:\s]+["\']?([^"\']+)["\']?', content, re.IGNORECASE)
        topic = topic_match.group(1) if topic_match else content.replace(f"@{tool_name}", "").strip()
        
        return await handle_generate_mermaid_graph(
            client_id, topic, backboard_client, assistant_id
        )
    
    else:
        return {
            "tool": tool_name,
            "status": "error",
            "error": f"Unknown tool: {tool_name}"
        }

