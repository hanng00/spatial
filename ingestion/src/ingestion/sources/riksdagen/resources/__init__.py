"""
Riksdagen API resource definitions.

Each resource module provides:
- get_resource(): Returns dlt resource configuration
- requires_pagination(): Whether the resource needs pagination
- get_paginator(): Returns paginator instance
- create_source(): Factory to create dlt source

Available resources:
- dokumentlista: Documents (decisions, propositions, motions, protocols)
- personlista: Members of Parliament
- anforandelista: Speeches from debates
- voteringlista: Voting records
"""

from . import dokumentlista, personlista, anforandelista, voteringlista

__all__ = ["dokumentlista", "personlista", "anforandelista", "voteringlista"]

