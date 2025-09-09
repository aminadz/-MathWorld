#!/usr/bin/env python3
"""
MathWorld Game Analyzer
=======================
Advanced analysis tool for MathWorld games and educational content.

Author: A.Cherifi
Version: 1.0
Date: 2025
"""

import json
import re
import random
from typing import Dict, List, Any, Tuple
from dataclasses import dataclass
from pathlib import Path

@dataclass
class GameAnalysis:
    """Analysis results for a game."""
    game_id: str
    title: str
    category: str
    complexity_score: float
    educational_value: float
    user_engagement: float
    code_quality: float
    suggestions: List[str]

class GameAnalyzer:
    """Advanced game analysis and recommendation system."""
    
    def __init__(self):
        self.categories = {
            'arithmetic': ['addition', 'subtraction', 'multiplication', 'division'],
            'puzzle': ['sudoku', 'kenken', 'kakuro', 'magic-square', 'number-search', '2048-game', 'crossmath'],
            'memory': ['memory-cards', 'time-quiz'],
            'logic': ['logic-puzzles'],
            'geometry': ['geometry-explorer', 'geometry-advanced'],
            'advanced': ['fraction-master', 'percentage-pro', 'algebra-basics', 'statistics-expert']
        }
        
        self.difficulty_keywords = {
            'easy': ['basic', 'simple', 'beginner', 'elementary'],
            'medium': ['intermediate', 'moderate', 'standard'],
            'hard': ['advanced', 'expert', 'challenging', 'complex']
        }
    
    def analyze_game_complexity(self, game_data: Dict[str, Any]) -> float:
        """Analyze the complexity of a game based on its features."""
        complexity_score = 0.0
        
        # Base complexity by category
        category_complexity = {
            'arithmetic': 0.3,
            'puzzle': 0.7,
            'memory': 0.4,
            'logic': 0.8,
            'geometry': 0.6,
            'advanced': 0.9
        }
        
        category = game_data.get('category', 'unknown')
        complexity_score += category_complexity.get(category, 0.5)
        
        # Analyze description for complexity indicators
        description = game_data.get('description', '').lower()
        for difficulty, keywords in self.difficulty_keywords.items():
            for keyword in keywords:
                if keyword in description:
                    if difficulty == 'easy':
                        complexity_score += 0.1
                    elif difficulty == 'medium':
                        complexity_score += 0.3
                    elif difficulty == 'hard':
                        complexity_score += 0.5
        
        return min(complexity_score, 1.0)
    
    def calculate_educational_value(self, game_data: Dict[str, Any]) -> float:
        """Calculate the educational value of a game."""
        educational_score = 0.0
        
        # Category-based educational value
        category_value = {
            'arithmetic': 0.9,  # Fundamental math skills
            'puzzle': 0.8,      # Problem-solving
            'memory': 0.6,      # Cognitive skills
            'logic': 0.9,       # Critical thinking
            'geometry': 0.8,    # Spatial reasoning
            'advanced': 0.7     # Advanced concepts
        }
        
        category = game_data.get('category', 'unknown')
        educational_score += category_value.get(category, 0.5)
        
        # Analyze title and description for educational keywords
        text = f"{game_data.get('title', '')} {game_data.get('description', '')}".lower()
        
        educational_keywords = [
            'math', 'mathematics', 'calculate', 'solve', 'problem',
            'equation', 'formula', 'geometry', 'algebra', 'fraction',
            'percentage', 'statistics', 'probability', 'logic', 'reasoning'
        ]
        
        keyword_count = sum(1 for keyword in educational_keywords if keyword in text)
        educational_score += min(keyword_count * 0.1, 0.3)
        
        return min(educational_score, 1.0)
    
    def estimate_user_engagement(self, game_data: Dict[str, Any]) -> float:
        """Estimate user engagement potential."""
        engagement_score = 0.5  # Base score
        
        # Category-based engagement
        category_engagement = {
            'puzzle': 0.9,      # Highly engaging
            'memory': 0.8,      # Interactive
            'arithmetic': 0.6,  # Educational but potentially repetitive
            'logic': 0.8,       # Challenging and engaging
            'geometry': 0.7,    # Visual and interactive
            'advanced': 0.5     # May be too complex for some users
        }
        
        category = game_data.get('category', 'unknown')
        engagement_score += category_engagement.get(category, 0.0)
        
        # Analyze for engaging keywords
        text = f"{game_data.get('title', '')} {game_data.get('description', '')}".lower()
        
        engaging_keywords = [
            'game', 'challenge', 'puzzle', 'match', 'find', 'solve',
            'interactive', 'fun', 'exciting', 'adventure', 'quest'
        ]
        
        keyword_count = sum(1 for keyword in engaging_keywords if keyword in text)
        engagement_score += min(keyword_count * 0.05, 0.2)
        
        return min(engagement_score, 1.0)
    
    def generate_improvement_suggestions(self, game_data: Dict[str, Any]) -> List[str]:
        """Generate suggestions for improving a game."""
        suggestions = []
        category = game_data.get('category', 'unknown')
        title = game_data.get('title', '').lower()
        
        # Category-specific suggestions
        if category == 'arithmetic':
            suggestions.extend([
                "Add progressive difficulty levels",
                "Include visual aids and animations",
                "Add time-based challenges",
                "Implement streak tracking"
            ])
        elif category == 'puzzle':
            suggestions.extend([
                "Add hint system for difficult puzzles",
                "Implement multiple difficulty levels",
                "Add puzzle generation algorithms",
                "Include solution explanations"
            ])
        elif category == 'memory':
            suggestions.extend([
                "Add sound effects for better engagement",
                "Implement memory training exercises",
                "Add difficulty progression",
                "Include memory tips and strategies"
            ])
        elif category == 'logic':
            suggestions.extend([
                "Add step-by-step solution guides",
                "Implement logical reasoning explanations",
                "Add multiple solution paths",
                "Include logical thinking tips"
            ])
        
        # General suggestions
        suggestions.extend([
            "Add achievement system",
            "Implement progress tracking",
            "Add multiplayer or competitive modes",
            "Include accessibility features"
        ])
        
        return suggestions[:4]  # Return top 4 suggestions
    
    def analyze_all_games(self, games_data: List[Dict[str, Any]]) -> List[GameAnalysis]:
        """Analyze all games and return comprehensive analysis."""
        analyses = []
        
        for game_data in games_data:
            analysis = GameAnalysis(
                game_id=game_data.get('id', 'unknown'),
                title=game_data.get('title', 'Unknown'),
                category=game_data.get('category', 'unknown'),
                complexity_score=self.analyze_game_complexity(game_data),
                educational_value=self.calculate_educational_value(game_data),
                user_engagement=self.estimate_user_engagement(game_data),
                code_quality=0.8,  # Placeholder - would need code analysis
                suggestions=self.generate_improvement_suggestions(game_data)
            )
            analyses.append(analysis)
        
        return analyses
    
    def generate_recommendations(self, analyses: List[GameAnalysis]) -> Dict[str, Any]:
        """Generate platform-wide recommendations."""
        recommendations = {
            'top_performing_games': [],
            'games_needing_improvement': [],
            'category_balance': {},
            'overall_suggestions': []
        }
        
        # Sort games by overall score
        for analysis in analyses:
            overall_score = (
                analysis.educational_value * 0.4 +
                analysis.user_engagement * 0.3 +
                analysis.complexity_score * 0.2 +
                analysis.code_quality * 0.1
            )
            
            if overall_score > 0.7:
                recommendations['top_performing_games'].append({
                    'title': analysis.title,
                    'score': overall_score,
                    'category': analysis.category
                })
            elif overall_score < 0.5:
                recommendations['games_needing_improvement'].append({
                    'title': analysis.title,
                    'score': overall_score,
                    'suggestions': analysis.suggestions
                })
        
        # Analyze category balance
        category_counts = {}
        for analysis in analyses:
            category_counts[analysis.category] = category_counts.get(analysis.category, 0) + 1
        
        recommendations['category_balance'] = category_counts
        
        # Overall suggestions
        recommendations['overall_suggestions'] = [
            "Consider adding more interactive elements to arithmetic games",
            "Implement a unified achievement system across all games",
            "Add difficulty progression for better user experience",
            "Include more visual and audio feedback",
            "Consider adding collaborative or competitive features"
        ]
        
        return recommendations
    
    def create_game_report(self, analyses: List[GameAnalysis]) -> str:
        """Create a comprehensive game analysis report."""
        report = []
        report.append("🎮 MathWorld Game Analysis Report")
        report.append("=" * 50)
        report.append("")
        
        # Overall statistics
        total_games = len(analyses)
        avg_complexity = sum(a.complexity_score for a in analyses) / total_games
        avg_educational = sum(a.educational_value for a in analyses) / total_games
        avg_engagement = sum(a.user_engagement for a in analyses) / total_games
        
        report.append(f"📊 Overall Statistics:")
        report.append(f"  Total Games: {total_games}")
        report.append(f"  Average Complexity: {avg_complexity:.2f}")
        report.append(f"  Average Educational Value: {avg_educational:.2f}")
        report.append(f"  Average Engagement: {avg_engagement:.2f}")
        report.append("")
        
        # Individual game analysis
        report.append("🎯 Individual Game Analysis:")
        report.append("-" * 30)
        
        for analysis in sorted(analyses, key=lambda x: x.complexity_score, reverse=True):
            overall_score = (
                analysis.educational_value * 0.4 +
                analysis.user_engagement * 0.3 +
                analysis.complexity_score * 0.2 +
                analysis.code_quality * 0.1
            )
            
            report.append(f"\n🎮 {analysis.title}")
            report.append(f"   Category: {analysis.category}")
            report.append(f"   Complexity: {analysis.complexity_score:.2f}")
            report.append(f"   Educational Value: {analysis.educational_value:.2f}")
            report.append(f"   Engagement: {analysis.user_engagement:.2f}")
            report.append(f"   Overall Score: {overall_score:.2f}")
            
            if analysis.suggestions:
                report.append("   💡 Suggestions:")
                for suggestion in analysis.suggestions[:2]:
                    report.append(f"      - {suggestion}")
        
        return "\n".join(report)

def main():
    """Main function to demonstrate the Game Analyzer."""
    print("🔍 MathWorld Game Analyzer")
    print("=" * 40)
    
    # Sample games data (would normally be loaded from the platform)
    sample_games = [
        {
            'id': 'addition-sprint',
            'title': 'Addition Sprint',
            'category': 'arithmetic',
            'description': 'Fast-paced addition practice game'
        },
        {
            'id': 'sudoku',
            'title': 'Sudoku',
            'category': 'puzzle',
            'description': 'Classic number puzzle game'
        },
        {
            'id': 'memory-cards',
            'title': 'Memory Cards',
            'category': 'memory',
            'description': 'Match pairs of cards to test your memory'
        },
        {
            'id': 'crossmath',
            'title': 'CrossMath',
            'category': 'puzzle',
            'description': 'Mathematical crossword puzzle'
        }
    ]
    
    analyzer = GameAnalyzer()
    
    # Analyze games
    print("\n🔍 Analyzing games...")
    analyses = analyzer.analyze_all_games(sample_games)
    
    # Generate recommendations
    print("\n💡 Generating recommendations...")
    recommendations = analyzer.generate_recommendations(analyses)
    
    # Display results
    print("\n📈 Analysis Results:")
    print(f"Top Performing Games: {len(recommendations['top_performing_games'])}")
    print(f"Games Needing Improvement: {len(recommendations['games_needing_improvement'])}")
    
    print("\n🏆 Top Performing Games:")
    for game in recommendations['top_performing_games']:
        print(f"  - {game['title']} (Score: {game['score']:.2f})")
    
    print("\n⚠️  Games Needing Improvement:")
    for game in recommendations['games_needing_improvement']:
        print(f"  - {game['title']} (Score: {game['score']:.2f})")
    
    # Create and save report
    print("\n📝 Creating analysis report...")
    report = analyzer.create_game_report(analyses)
    
    with open('game_analysis_report.txt', 'w', encoding='utf-8') as f:
        f.write(report)
    
    print("✅ Analysis report saved to 'game_analysis_report.txt'")
    print("\n🎉 Game analysis completed successfully!")

if __name__ == "__main__":
    main()
