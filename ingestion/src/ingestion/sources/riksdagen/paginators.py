"""
Custom paginators for Riksdagen API resources.

Some resources don't support standard pagination and require custom logic.
"""

from typing import Any, Dict, Optional
from dlt.sources.helpers.rest_client.paginators import BasePaginator


class RiksmotePaginator(BasePaginator):
    """
    Custom paginator for anforandelista resource using Riksmöte (parliamentary session) filtering.
    
    Uses the 'rm' parameter to paginate through different parliamentary sessions.
    This allows us to traverse all ~600K speeches by partitioning them by session.
    Supports date filtering to slice the Riksmöte range.
    """
    
    def __init__(self, start_date: str | None = None, end_date: str | None = None):
        # All parliamentary sessions from most recent to oldest
        # Format: YYYY/YY (e.g., 2024/25, 2023/24, etc.)
        all_sessions = [
            "2024/25", "2023/24", "2022/23", "2021/22", "2020/21", "2019/20", 
            "2018/19", "2017/18", "2016/17", "2015/16", "2014/15", "2013/14",
            "2012/13", "2011/12", "2010/11", "2009/10", "2008/09", "2007/08",
            "2006/07", "2005/06", "2004/05", "2003/04", "2002/03", "2001/02",
            "2000/01", "1999/00", "1998/99", "1997/98", "1996/97", "1995/96",
            "1994/95", "1993/94", "1992/93", "1991/92", "1990/91"
        ]
        
        # Filter sessions based on date range if provided
        self.riksmote_sessions = self._filter_sessions_by_date(all_sessions, start_date, end_date)
        self.current_session_index = 0
        self._has_next_page = True
        self.first_request = True
    
    def _filter_sessions_by_date(self, sessions: list[str], start_date: str | None, end_date: str | None) -> list[str]:
        """Filter riksmöte sessions based on date range."""
        if not start_date and not end_date:
            return sessions
        
        # Parse dates to extract years
        start_year = int(start_date[:4]) if start_date else 1990
        end_year = int(end_date[:4]) if end_date else 2025
        
        # Filter sessions that fall within the date range
        # A session like "2024/25" spans from September 2024 to June 2025
        filtered = []
        for session in sessions:
            session_start_year = int(session[:4])
            session_end_year = int("20" + session[5:7])  # Convert "25" to 2025
            
            # Include session if it overlaps with the date range
            if session_start_year <= end_year and session_end_year >= start_year:
                filtered.append(session)
        
        return filtered if filtered else sessions
    
    def update_state(self, response: Any, data: Any = None) -> None:
        """Update paginator state based on response."""
        try:
            # data parameter is already the extracted list of speeches
            if data is not None and isinstance(data, list):
                pass
            else:
                # Fallback to parsing response
                if not response or not hasattr(response, 'json'):
                    self._has_next_page = False
                    return
            
            # Move to next session after processing current one
            self.current_session_index += 1
            self._has_next_page = self.current_session_index < len(self.riksmote_sessions)
                
        except Exception:
            self._has_next_page = False
    
    def get_next_request_params(self) -> Optional[Dict[str, Any]]:
        """Get parameters for the next request."""
        if not self._has_next_page or self.current_session_index >= len(self.riksmote_sessions):
            return None
        
        current_session = self.riksmote_sessions[self.current_session_index]
        return {
            'rm': current_session
        }
    
    def get_initial_request_params(self) -> Dict[str, Any]:
        """Get parameters for the initial request."""
        if self.current_session_index < len(self.riksmote_sessions):
            current_session = self.riksmote_sessions[self.current_session_index]
            return {
                'rm': current_session
            }
        return {}
    
    def init_request(self, request: Any) -> Any:
        """Initialize the first request with rm parameter."""
        # Add rm parameter for the first session
        params = self.get_initial_request_params()
        if params:
            if hasattr(request, 'params'):
                request.params.update(params)
        return request
    
    def update_request(self, request: Any) -> Any:
        """Update the request with pagination parameters."""
        # Get params for next session
        params = self.get_next_request_params()
        
        if params:
            # Update request parameters
            if hasattr(request, 'params'):
                request.params.update(params)
            elif hasattr(request, 'url'):
                # Handle URL-based requests
                from urllib.parse import urlencode, urlparse, parse_qs, urlunparse
                parsed = urlparse(request.url)
                query_params = parse_qs(parsed.query)
                query_params.update(params)
                new_query = urlencode(query_params, doseq=True)
                request.url = urlunparse(parsed._replace(query=new_query))
        
        return request
    
    @property
    def has_next_page(self) -> bool:
        """Check if there are more pages to fetch."""
        return self._has_next_page
    
    def reset(self) -> None:
        """Reset paginator state."""
        self.current_session_index = 0
        self._has_next_page = True
        self.first_request = True


class VoteringlistaIncrementalPaginator(BasePaginator):
    """
    Incremental paginator for voteringlista resource.
    
    For incremental loads, fetches the latest riksmöte across all valkrets.
    Uses systemdatum as cursor for filtering new records.
    Supports date filtering to specify which riksmöte to fetch.
    """
    
    def __init__(self, start_date: str | None = None, end_date: str | None = None):
        # Electoral districts (valkrets) - same as full refresh
        self.valkretsar = [
            "Blekinge län",
            "Dalarnas län",
            "Gotlands län",
            "Gävleborgs län",
            "Göteborgs kommun",
            "Hallands län",
            "Jämtlands län",
            "Jönköpings län",
            "Kalmar län",
            "Kronobergs län",
            "Malmö kommun",
            "Norrbottens län",
            "Skåne läns norra och östra",
            "Skåne läns södra",
            "Skåne läns västra",
            "Stockholms kommun",
            "Stockholms län",
            "Södermanlands län",
            "Uppsala län",
            "Värmlands län",
            "Västerbottens län",
            "Västernorrlands län",
            "Västmanlands län",
            "Västra Götalands läns norra",
            "Västra Götalands läns södra",
            "Västra Götalands läns västra",
            "Västra Götalands läns östra",
            "Örebro län",
            "Östergötlands län"
        ]
        
        # Determine riksmöte based on end_date or use latest
        self.current_riksmote = self._determine_riksmote(end_date)
        self.current_valkrets_index = 0
        self._has_next_page = True
        self.first_request = True
    
    def _determine_riksmote(self, end_date: str | None) -> str:
        """Determine which riksmöte to fetch based on end_date."""
        if not end_date:
            return "2024/25"  # Default to latest
        
        # Extract year from end_date
        end_year = int(end_date[:4])
        
        # Map year to riksmöte (sessions run Sep-Jun, so 2024 could be 2023/24 or 2024/25)
        # Use the session that starts in that year
        next_year_suffix = str(end_year + 1)[2:]
        return f"{end_year}/{next_year_suffix}"
    
    def update_state(self, response: Any, data: Any = None) -> None:
        """Update paginator state based on response."""
        try:
            # Extract data to detect riksmöte if needed
            if data is not None and isinstance(data, list) and len(data) > 0:
                # Get riksmöte from first record to ensure we're on the right session
                first_record = data[0]
                if 'rm' in first_record:
                    self.current_riksmote = first_record['rm']
            
            # Move to next valkrets
            self.current_valkrets_index += 1
            
            # If we've exhausted all valkretsar, we're done (incremental only needs latest riksmöte)
            self._has_next_page = self.current_valkrets_index < len(self.valkretsar)
                
        except Exception:
            self._has_next_page = False
    
    def get_next_request_params(self) -> Optional[Dict[str, Any]]:
        """Get parameters for the next request."""
        if not self._has_next_page or self.current_valkrets_index >= len(self.valkretsar):
            return None
        
        current_valkrets = self.valkretsar[self.current_valkrets_index]
        
        return {
            'rm': self.current_riksmote,
            'valkrets': current_valkrets
        }
    
    def get_initial_request_params(self) -> Dict[str, Any]:
        """Get parameters for the initial request."""
        if self.current_valkrets_index < len(self.valkretsar):
            current_valkrets = self.valkretsar[self.current_valkrets_index]
            return {
                'rm': self.current_riksmote,
                'valkrets': current_valkrets
            }
        return {}
    
    def init_request(self, request: Any) -> Any:
        """Initialize the first request with rm and valkrets parameters."""
        params = self.get_initial_request_params()
        if params:
            if hasattr(request, 'params'):
                request.params.update(params)
        return request
    
    def update_request(self, request: Any) -> Any:
        """Update the request with pagination parameters."""
        params = self.get_next_request_params()
        
        if params:
            if hasattr(request, 'params'):
                request.params.update(params)
            elif hasattr(request, 'url'):
                from urllib.parse import urlencode, urlparse, parse_qs, urlunparse
                parsed = urlparse(request.url)
                query_params = parse_qs(parsed.query)
                query_params.update(params)
                new_query = urlencode(query_params, doseq=True)
                request.url = urlunparse(parsed._replace(query=new_query))
        
        return request
    
    @property
    def has_next_page(self) -> bool:
        """Check if there are more pages to fetch."""
        return self._has_next_page
    
    def reset(self) -> None:
        """Reset paginator state."""
        self.current_riksmote = "2024/25"
        self.current_valkrets_index = 0
        self._has_next_page = True
        self.first_request = True


class VoteringlistaPaginator(BasePaginator):
    """
    Custom paginator for voteringlista resource using 2D pagination.
    
    Paginates through all combinations of Riksmöte (parliamentary session) 
    and Valkrets (electoral district) to fetch complete voting records.
    Supports date filtering to slice the Riksmöte range.
    """
    
    def __init__(self, start_date: str | None = None, end_date: str | None = None):
        # All parliamentary sessions
        all_sessions = [
            "2024/25", "2023/24", "2022/23", "2021/22", "2020/21", "2019/20", 
            "2018/19", "2017/18", "2016/17", "2015/16", "2014/15", "2013/14",
            "2012/13", "2011/12", "2010/11", "2009/10", "2008/09", "2007/08",
            "2006/07", "2005/06", "2004/05", "2003/04", "2002/03", "2001/02",
            "2000/01", "1999/00", "1998/99", "1997/98", "1996/97", "1995/96",
            "1994/95", "1993/94", "1992/93", "1991/92", "1990/91"
        ]
        
        # Filter sessions based on date range if provided
        self.riksmote_sessions = self._filter_sessions_by_date(all_sessions, start_date, end_date)
        
        # Electoral districts (valkrets)
        self.valkretsar = [
            "Blekinge län",
            "Dalarnas län",
            "Gotlands län",
            "Gävleborgs län",
            "Göteborgs kommun",
            "Hallands län",
            "Jämtlands län",
            "Jönköpings län",
            "Kalmar län",
            "Kronobergs län",
            "Malmö kommun",
            "Norrbottens län",
            "Skåne läns norra och östra",
            "Skåne läns södra",
            "Skåne läns västra",
            "Stockholms kommun",
            "Stockholms län",
            "Södermanlands län",
            "Uppsala län",
            "Värmlands län",
            "Västerbottens län",
            "Västernorrlands län",
            "Västmanlands län",
            "Västra Götalands läns norra",
            "Västra Götalands läns södra",
            "Västra Götalands läns västra",
            "Västra Götalands läns östra",
            "Örebro län",
            "Östergötlands län"
        ]
        
        self.current_riksmote_index = 0
        self.current_valkrets_index = 0
        self._has_next_page = True
        self.first_request = True
    
    def _filter_sessions_by_date(self, sessions: list[str], start_date: str | None, end_date: str | None) -> list[str]:
        """Filter riksmöte sessions based on date range."""
        if not start_date and not end_date:
            return sessions
        
        # Parse dates to extract years
        start_year = int(start_date[:4]) if start_date else 1990
        end_year = int(end_date[:4]) if end_date else 2025
        
        # Filter sessions that fall within the date range
        filtered = []
        for session in sessions:
            session_start_year = int(session[:4])
            session_end_year = int("20" + session[5:7])  # Convert "25" to 2025
            
            # Include session if it overlaps with the date range
            if session_start_year <= end_year and session_end_year >= start_year:
                filtered.append(session)
        
        return filtered if filtered else sessions
    
    def update_state(self, response: Any, data: Any = None) -> None:
        """Update paginator state based on response."""
        try:
            # Move to next combination after processing current one
            self.current_valkrets_index += 1
            
            # If we've exhausted all valkretsar for current riksmöte, move to next riksmöte
            if self.current_valkrets_index >= len(self.valkretsar):
                self.current_valkrets_index = 0
                self.current_riksmote_index += 1
            
            # Check if we've exhausted all combinations
            self._has_next_page = self.current_riksmote_index < len(self.riksmote_sessions)
                
        except Exception:
            self._has_next_page = False
    
    def get_next_request_params(self) -> Optional[Dict[str, Any]]:
        """Get parameters for the next request."""
        if not self._has_next_page or self.current_riksmote_index >= len(self.riksmote_sessions):
            return None
        
        current_riksmote = self.riksmote_sessions[self.current_riksmote_index]
        current_valkrets = self.valkretsar[self.current_valkrets_index]
        
        return {
            'rm': current_riksmote,
            'valkrets': current_valkrets
        }
    
    def get_initial_request_params(self) -> Dict[str, Any]:
        """Get parameters for the initial request."""
        if (self.current_riksmote_index < len(self.riksmote_sessions) and 
            self.current_valkrets_index < len(self.valkretsar)):
            current_riksmote = self.riksmote_sessions[self.current_riksmote_index]
            current_valkrets = self.valkretsar[self.current_valkrets_index]
            return {
                'rm': current_riksmote,
                'valkrets': current_valkrets
            }
        return {}
    
    def init_request(self, request: Any) -> Any:
        """Initialize the first request with rm and valkrets parameters."""
        params = self.get_initial_request_params()
        if params:
            if hasattr(request, 'params'):
                request.params.update(params)
        return request
    
    def update_request(self, request: Any) -> Any:
        """Update the request with pagination parameters."""
        params = self.get_next_request_params()
        
        if params:
            if hasattr(request, 'params'):
                request.params.update(params)
            elif hasattr(request, 'url'):
                from urllib.parse import urlencode, urlparse, parse_qs, urlunparse
                parsed = urlparse(request.url)
                query_params = parse_qs(parsed.query)
                query_params.update(params)
                new_query = urlencode(query_params, doseq=True)
                request.url = urlunparse(parsed._replace(query=new_query))
        
        return request
    
    @property
    def has_next_page(self) -> bool:
        """Check if there are more pages to fetch."""
        return self._has_next_page
    
    def reset(self) -> None:
        """Reset paginator state."""
        self.current_riksmote_index = 0
        self.current_valkrets_index = 0
        self._has_next_page = True
        self.first_request = True


class AnforandelistaPaginator(BasePaginator):
    """
    Custom paginator for anforandelista resource.
    
    Uses dok_datum (document date) for pagination by setting the 'd' parameter
    to the latest date from the current response to fetch the next batch.
    """
    
    def __init__(self):
        self.last_date: Optional[str] = None
        self.has_more_pages = True
        self.first_request = True
        self._has_next_page = True
    
    def update_state(self, response: Any, data: Any = None) -> None:
        """Update paginator state based on response."""
        if not response or not hasattr(response, 'json'):
            self.has_more_pages = False
            return
        
        try:
            # Use the data parameter if provided, otherwise parse response
            if data is not None:
                json_data = data
            else:
                json_data = response.json()
            
            anforanden = json_data.get('anforandelista', {}).get('anforande', [])
            
            if not anforanden:
                self.has_more_pages = False
                return
            
            # Find the latest dok_datum in the response
            latest_date = None
            for anforande in anforanden:
                dok_datum = anforande.get('dok_datum')
                if dok_datum and (latest_date is None or dok_datum > latest_date):
                    latest_date = dok_datum
            
            if latest_date:
                self.last_date = latest_date
                # Continue if we got a full page (assuming 10000 is max)
                self.has_more_pages = len(anforanden) >= 10000
                self._has_next_page = self.has_more_pages
            else:
                self.has_more_pages = False
                self._has_next_page = False
                
        except Exception:
            self.has_more_pages = False
            self._has_next_page = False
    
    def get_next_request_params(self) -> Optional[Dict[str, Any]]:
        """Get parameters for the next request."""
        if not self.has_more_pages or not self.last_date:
            return None
        
        return {
            'd': self.last_date
        }
    
    def update_request(self, request: Any) -> Any:
        """Update the request with pagination parameters."""
        if self.first_request:
            self.first_request = False
            return request
        
        params = self.get_next_request_params()
        if params:
            # Update request parameters
            if hasattr(request, 'params'):
                request.params.update(params)
            elif hasattr(request, 'url'):
                # Handle URL-based requests
                from urllib.parse import urlencode, urlparse, parse_qs, urlunparse
                parsed = urlparse(request.url)
                query_params = parse_qs(parsed.query)
                query_params.update(params)
                new_query = urlencode(query_params, doseq=True)
                request.url = urlunparse(parsed._replace(query=new_query))
        
        return request
    
    def reset(self) -> None:
        """Reset paginator state."""
        self.last_date = None
        self.has_more_pages = True
        self.first_request = True
        self._has_next_page = True
