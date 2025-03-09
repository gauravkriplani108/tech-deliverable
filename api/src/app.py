from contextlib import asynccontextmanager
from datetime import datetime, timedelta
from typing import AsyncIterator

from fastapi import FastAPI, Form, status, Query
from fastapi.responses import RedirectResponse
from typing_extensions import TypedDict

from services.database import JSONDatabase


class Quote(TypedDict):
    name: str
    message: str
    time: str


database: JSONDatabase[list[Quote]] = JSONDatabase("data/database.json")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    """Handle database management when running app."""
    if "quotes" not in database:
        print("Adding quotes entry to database")
        database["quotes"] = []

    yield

    database.close()


app = FastAPI(lifespan=lifespan)


@app.post("/quote")
def post_message(name: str = Form(), message: str = Form()) -> dict:
    """
    Process a user submitting a new quote.
    You should not modify this function except for the return value.
    """
    now = datetime.now()
    quote = Quote(name=name, message=message, time=now.isoformat(timespec="seconds"))
    database["quotes"].append(quote)

    # Return the quote that was added (modified this)
    return {"message": "Quote added successfully", "quote": quote}


# API route to retrieve quotes based on max age
@app.get("/quote")
def get_quotes(max_age: str = Query("all", enum=["week", "month", "year", "all"])):
    """
    Get quotes based on the max age specified.
    """

    now = datetime.now()  # get the current date and time
    filter_time = None  # set filter time to none by default (which means all quotes)

    # Determine filter time based on max_age selection
    if max_age == "week":
        filter_time = now - timedelta(weeks=1)  # 1 week ago
    elif max_age == "month":
        filter_time = now - timedelta(days=30)  # Approximate 1 month
    elif max_age == "year":
        filter_time = now - timedelta(days=365)  # Approximate 1 year
    # else:
    #     filter_time = None # all

    # Get all the quotes
    quotes = database["quotes"]

    # For storing the filtered quotes
    quotes_filtered = []

    # Use the filter time selected to return the filter the quotes
    if filter_time:
        for quote in quotes:
            quote_time = datetime.fromisoformat(quote["time"])  # get the time of the quote
            if quote_time >= filter_time:
                quotes_filtered.append(quote)
    else:
        quotes_filtered = quotes

    return quotes_filtered
