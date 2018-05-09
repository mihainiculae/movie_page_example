var endPageEvent = new Event("endOfPage");
window.onscroll = function(ev) {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
        document.dispatchEvent(endPageEvent);
    }
};

function clearChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

// lazy span creation
function makeStatusElement(text) {
    return document
        .createElement("span")
        .appendChild(document.createTextNode(text));
}

function formSubmit() {
    var results = document.getElementById("result");
    clearChildren(results);
    results.appendChild(makeStatusElement("Loading..."));
    var form = document.getElementById("movieSearch");
    var query = form.elements["title"].value.trim();
    contentLoader(query, results);
}

function contentLoader(query, resultsGallery, pageNo = 1) {
    getMovieData(query, pageNo)
        .then(result => {
            if (pageNo == 1) {
                clearChildren(resultsGallery);
            }
            if (result.page == 1 && result.data.length < 1) {
                resultsGallery.appendChild(makeStatusElement("Not Found :("));
            } else {
                appendToGallery(result.data, resultsGallery);
                if (result.page < result.total_pages) {
                    pageNo++;
                    return contentLoader(query, resultsGallery, pageNo);
                }
            }
        })
        .catch(err => {
            resultsGallery.appendChild(
                makeStatusElement("Something went boom..." + err)
            );
        });
}

function appendToGallery(data, resultsGallery) {
    var justMovies = data.filter(element => {
        return element.Type == "movie";
    });
    justMovies.forEach((movie, index) => {
        resultsGallery.appendChild(makeMovieDiv(movie, index));
    });
}

function appendToGalleryColumns(data, resultsGallery, colNo = 4) {
    var justMovies = data.filter(element => {
        return element.Type == "movie";
    });
    var columnDiv = null;
    justMovies.forEach((movie, index) => {
        if (index % maxHorizontal === 0) {
            columnDiv = document.createElement("div");
            columnDiv.setAttribute("class", "column");
            columnDiv.appendChild(makeMovieDiv(movie, index));
        } else if (index % maxHorizontal === colNo - 1) {
            resultsGallery.appendChild(columnDiv);
            columnDiv = null;
        } else {
            columnDiv.appendChild(makeMovieDiv(movie, index));
        }
    });
}

function makeMovieDiv(movieData, index) {
    const baseImdbUri = "https://www.imdb.com/title/";
    var defaultImage = "./assets/default.jpg";
    var imgSrc = movieData.Poster == "N/A" ? defaultImage : movieData.Poster;

    // create image link
    var link = document.createElement("a");
    link.setAttribute("href", baseImdbUri + movieData.imdbID);
    link.setAttribute("target", "_blank");

    // create image element
    var poster = document.createElement("img");
    poster.setAttribute("border", "0");
    poster.setAttribute("alt", movieData.Title + " movie poster");
    poster.setAttribute("src", imgSrc);
    poster.setAttribute("onerror", "this.src=" + defaultImage);
    poster.setAttribute("class", "posterImage");
    link.appendChild(poster);

    // create title element
    var title = document.createElement("span");
    title.setAttribute("class", "descSpan");
    title.appendChild(document.createTextNode(movieData.Title));
    var description = document.createElement("span");
    description.setAttribute("class", "descSpan");
    description.appendChild(
        document.createTextNode(
            movieData.Type.toUpperCase() + ", " + movieData.Year
        )
    );
    // create the div to hold them all
    var movieDiv = document.createElement("div");
    movieDiv.setAttribute("class", "movieBox");
    movieDiv.setAttribute("id", "movieBox" + index);
    movieDiv.appendChild(link);
    movieDiv.appendChild(title);
    movieDiv.appendChild(description);
    return movieDiv;
}

function getMovieData(title, pageNo) {
    var baseUri =
        "https://jsonmock.hackerrank.com/api/movies/search/?Title=" +
        title +
        "&page=" +
        pageNo;
    return fetch(baseUri, {
        method: "GET",
        headers: {
            "content-type": "application/json"
        }
    }).then(response => response.json());
}
