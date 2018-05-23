var endPageEvent = new Event("endOfPage");
window.onscroll = function(ev) {
    if (window.innerHeight + window.pageYOffset >= document.body.offsetHeight) {
        document.dispatchEvent(endPageEvent);
    }
};

var state = "initialized";

function clearChildren(element, cb) {
    console.log("clearing");
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
    if (state === "initialized") state = "newSearch";
    if (state === "loading") state = "cleanUp";
    var resultsGallery = document.getElementById("resultsGallery");
    clearChildren(resultsGallery);
    resultsGallery.appendChild(makeStatusElement("Loading..."));
    var form = document.getElementById("movieSearch");
    var query = form.elements["title"].value.trim();
    contentLoader(query, resultsGallery);
}

function contentLoader(query, resultsGallery, pageNo = 1) {
    if (state == "cleanUp") {
        clearChildren(resultsGallery);
        state = "newSearch";
        return;
    }
    if (state == "newSearch") {
        state = "loading";
    }
    getMovieData(query, pageNo)
        .then(result => {
            if (pageNo == 1) {
                clearChildren(resultsGallery);
            }
            if (result.page == 1 && result.data.length < 1) {
                resultsGallery.appendChild(makeStatusElement("Not Found :("));
            } else {
                // just use movies
                let filteredMovies = result.data.filter(item => {
                    return item.Type == "movie";
                });
                appendToGallery(filteredMovies, resultsGallery);
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
    data.forEach(movie => {
        resultsGallery.appendChild(makeMovieDiv(movie));
    });
}

function makeMovieDiv(movieData) {
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
    poster.setAttribute("onerror", "this.src='" + defaultImage + "'");
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
