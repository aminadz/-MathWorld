#!/usr/bin/env python3
"""
MathWorld Platform Manager
==========================
A Python utility to manage and enhance the MathWorld educational platform.

Author: A.Cherifi
Version: 1.0
Date: 2025
"""

import json
import os
import re
import random
from typing import Dict, List, Tuple, Any
from dataclasses import dataclass
from pathlib import Path

@dataclass
class Game:
    """Represents a game in the MathWorld platform."""
    id: str
    title: str
    category: str
    description: str
    icon: str
    difficulty: str = "medium"
    languages: List[str] = None
    
    def __post_init__(self):
        if self.languages is None:
            self.languages = ["en", "ar", "fr"]

class MathWorldManager:
    """Main manager class for MathWorld platform."""
    
    def __init__(self, base_path: str = "."):
        self.base_path = Path(base_path)
        self.games_file = self.base_path / "script.js"
        self.html_file = self.base_path / "index.html"
        self.readme_file = self.base_path / "README.md"
        
    def extract_games_from_js(self) -> List[Dict[str, Any]]:
        """Extract games data from JavaScript file."""
        try:
            with open(self.games_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find games array
            games_match = re.search(r'const games = \[(.*?)\];', content, re.DOTALL)
            if not games_match:
                return []
            
            games_text = games_match.group(1)
            games = []
            
            # Parse individual game objects
            game_pattern = r'\{[^}]*id:\s*[\'"]([^\'"]+)[\'"][^}]*\}'
            for match in re.finditer(game_pattern, games_text, re.DOTALL):
                game_block = match.group(0)
                
                # Extract game properties
                game_data = {}
                for prop in ['id', 'title', 'category', 'description', 'icon']:
                    prop_match = re.search(f'{prop}:\s*[\'"]([^\'"]+)[\'"]', game_block)
                    if prop_match:
                        game_data[prop] = prop_match.group(1)
                
                if game_data:
                    games.append(game_data)
            
            return games
            
        except Exception as e:
            print(f"Error extracting games: {e}")
            return []
    
    def generate_game_statistics(self) -> Dict[str, Any]:
        """Generate statistics about the games."""
        games = self.extract_games_from_js()
        
        stats = {
            "total_games": len(games),
            "categories": {},
            "languages_supported": ["en", "ar", "fr"],
            "games_by_category": {},
            "difficulty_distribution": {"easy": 0, "medium": 0, "hard": 0}
        }
        
        for game in games:
            category = game.get('category', 'unknown')
            stats["categories"][category] = stats["categories"].get(category, 0) + 1
            
            if category not in stats["games_by_category"]:
                stats["games_by_category"][category] = []
            stats["games_by_category"][category].append(game['title'])
        
        return stats
    
    def create_game_template(self, game_id: str, title: str, category: str, 
                           description: str, icon: str) -> str:
        """Create a JavaScript template for a new game."""
        template = f"""
    {{
        id: '{game_id}',
        title: '{title}',
        category: '{category}',
        description: '{description}',
        icon: '{icon}'
    }}"""
        return template
    
    def generate_random_math_problems(self, count: int = 10) -> List[Dict[str, Any]]:
        """Generate random math problems for testing."""
        problems = []
        operations = ['+', '-', '*', '/']
        
        for _ in range(count):
            operation = random.choice(operations)
            if operation == '+':
                a = random.randint(1, 50)
                b = random.randint(1, 50)
                answer = a + b
            elif operation == '-':
                a = random.randint(10, 50)
                b = random.randint(1, a)
                answer = a - b
            elif operation == '*':
                a = random.randint(2, 12)
                b = random.randint(2, 12)
                answer = a * b
            else:  # division
                answer = random.randint(2, 12)
                b = random.randint(2, 12)
                a = answer * b
            
            problems.append({
                "question": f"{a} {operation} {b} = ?",
                "answer": answer,
                "operation": operation,
                "difficulty": "easy" if answer < 20 else "medium" if answer < 100 else "hard"
            })
        
        return problems
    
    def validate_platform_structure(self) -> Dict[str, bool]:
        """Validate the platform file structure."""
        validation = {
            "index_html_exists": self.html_file.exists(),
            "script_js_exists": self.games_file.exists(),
            "readme_exists": self.readme_file.exists(),
            "files_readable": True,
            "games_parsable": True
        }
        
        try:
            # Check if files are readable
            if validation["index_html_exists"]:
                with open(self.html_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    validation["html_has_games"] = "games" in content.lower()
            
            if validation["script_js_exists"]:
                with open(self.games_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    validation["js_has_games_array"] = "const games" in content
                    validation["js_has_translations"] = "translations" in content
            
        except Exception as e:
            validation["files_readable"] = False
            print(f"Error reading files: {e}")
        
        return validation
    
    def export_games_to_json(self, output_file: str = "games_export.json") -> bool:
        """Export games data to JSON file."""
        try:
            games = self.extract_games_from_js()
            stats = self.generate_game_statistics()
            
            export_data = {
                "platform_info": {
                    "name": "MathWorld",
                    "version": "1.0",
                    "author": "A.Cherifi",
                    "year": "2025"
                },
                "statistics": stats,
                "games": games
            }
            
            with open(output_file, 'w', encoding='utf-8') as f:
                json.dump(export_data, f, indent=2, ensure_ascii=False)
            
            print(f"Games exported successfully to {output_file}")
            return True
            
        except Exception as e:
            print(f"Error exporting games: {e}")
            return False
    
    def create_backup(self, backup_name: str = None) -> str:
        """Create a backup of the platform files."""
        if not backup_name:
            from datetime import datetime
            backup_name = f"mathworld_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        backup_dir = self.base_path / "backups" / backup_name
        backup_dir.mkdir(parents=True, exist_ok=True)
        
        files_to_backup = [self.html_file, self.games_file, self.readme_file]
        
        for file_path in files_to_backup:
            if file_path.exists():
                backup_file = backup_dir / file_path.name
                with open(file_path, 'r', encoding='utf-8') as src:
                    with open(backup_file, 'w', encoding='utf-8') as dst:
                        dst.write(src.read())
        
        print(f"Backup created in: {backup_dir}")
        return str(backup_dir)
    
    def analyze_code_quality(self) -> Dict[str, Any]:
        """Analyze the code quality of the platform."""
        analysis = {
            "total_lines": 0,
            "functions_count": 0,
            "games_count": 0,
            "translations_count": 0,
            "potential_issues": []
        }
        
        try:
            with open(self.games_file, 'r', encoding='utf-8') as f:
                content = f.read()
                lines = content.split('\n')
                analysis["total_lines"] = len(lines)
                
                # Count functions
                function_matches = re.findall(r'function\s+\w+', content)
                analysis["functions_count"] = len(function_matches)
                
                # Count games
                games = self.extract_games_from_js()
                analysis["games_count"] = len(games)
                
                # Count translations
                translation_matches = re.findall(r'[\'"][\w\s]+[\'"]:\s*[\'"][^\'"]+[\'"]', content)
                analysis["translations_count"] = len(translation_matches)
                
                # Check for potential issues
                if 'console.log' in content:
                    analysis["potential_issues"].append("Found console.log statements")
                
                if 'alert(' in content:
                    analysis["potential_issues"].append("Found alert() statements")
                
                if 'TODO' in content or 'FIXME' in content:
                    analysis["potential_issues"].append("Found TODO/FIXME comments")
        
        except Exception as e:
            analysis["error"] = str(e)
        
        return analysis

def main():
    """Main function to demonstrate the MathWorld Manager."""
    print("🎮 MathWorld Platform Manager")
    print("=" * 40)
    
    manager = MathWorldManager()
    
    # Generate statistics
    print("\n📊 Platform Statistics:")
    stats = manager.generate_game_statistics()
    print(f"Total Games: {stats['total_games']}")
    print(f"Categories: {list(stats['categories'].keys())}")
    
    for category, count in stats['categories'].items():
        print(f"  - {category}: {count} games")
    
    # Validate structure
    print("\n🔍 Platform Validation:")
    validation = manager.validate_platform_structure()
    for check, result in validation.items():
        status = "✅" if result else "❌"
        print(f"  {status} {check.replace('_', ' ').title()}")
    
    # Code quality analysis
    print("\n📈 Code Quality Analysis:")
    analysis = manager.analyze_code_quality()
    print(f"Total Lines: {analysis['total_lines']}")
    print(f"Functions: {analysis['functions_count']}")
    print(f"Games: {analysis['games_count']}")
    print(f"Translations: {analysis['translations_count']}")
    
    if analysis['potential_issues']:
        print("\n⚠️  Potential Issues:")
        for issue in analysis['potential_issues']:
            print(f"  - {issue}")
    
    # Generate sample math problems
    print("\n🧮 Sample Math Problems:")
    problems = manager.generate_random_math_problems(5)
    for i, problem in enumerate(problems, 1):
        print(f"  {i}. {problem['question']} (Answer: {problem['answer']})")
    
    # Export games data
    print("\n💾 Exporting games data...")
    if manager.export_games_to_json():
        print("✅ Export completed successfully!")
    
    # Create backup
    print("\n🔄 Creating backup...")
    backup_path = manager.create_backup()
    print(f"✅ Backup created at: {backup_path}")
    
    print("\n🎉 MathWorld Manager completed successfully!")

if __name__ == "__main__":
    main()
