import json

def push_file(file_name: str, content: str, server: str, id: int) -> str:
    """Get the JSON RPC query to push a file to the game."""
    return json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": "pushFile",
        "params": {
            "filename": file_name,
            "content": content,
            "server": server,
        },
    })
    
def get_file(file_name: str, server: str, id: int) -> str:
    """Get the JSON RPC query to get a file from the game."""
    return json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": "getFile",
        "params": {
            "filename": file_name,
            "server": server,
        },
    })

def get_file_names(server: str, id: int) -> str:
    """Get the JSON RPC query to get all file names from the game."""
    return json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": "getFileNames",
        "params": {
            "server": server,
        },
    })

def delete_file(file_name: str, server: str, id: int) -> str:
    """Get the JSON RPC query to delete a file from the game."""
    return json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": "deleteFile",
        "params": {
            "filename": file_name,
            "server": server,
        },
    })

def get_all_files(server: str, id: int) -> str:
    """Get the JSON RPC query to get all files from the game."""
    return json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": "getAllFiles",
        "params": {
            "server": server,
        },
    })

def calculate_ram(file_name: str, server: str, id: int) -> str:
    """Get the JSON RPC query to calculate the RAM usage of the game."""
    return json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": "calculateRam",
        "params": {
            "filename": file_name,
            "server": server,
        },
    })

def getDefinitionFile(id: int) -> str:
    """Get the JSON RPC query to get the definition file."""
    return json.dumps({
        "jsonrpc": "2.0",
        "id": id,
        "method": "getDefinitionFile",
    })