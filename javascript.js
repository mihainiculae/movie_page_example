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

function contentLoader(query, resultsElement, pageNo = 1) {
    doFetch(query, pageNo)
        .then(result => {
            if (pageNo == 1) {
                clearChildren(resultsElement);
            }
            if (result.page == 1 && result.data.length < 1) {
                resultsElement.appendChild(makeStatusElement("Not Found :("));
            } else {
                appendToList(result.data, resultsElement);
                if (result.page < result.total_pages) {
                    pageNo++;
                    return contentLoader(query, resultsElement, pageNo);
                }
            }
        })
        .catch(err => {
            resultsElement.appendChild(
                makeStatusElement("Something went boom..." + err)
            );
        });
}

function doFetch(query, pageNo) {
    return getMovieData(query, pageNo);
}

function appendToList(data, resultsElement) {
    var justMovies = data.filter(element => {
        return element.Type == "movie";
    });
    justMovies.forEach((movie, index) => {
        resultsElement.appendChild(makeMovieDiv(movie, index));
    });
}

function makeMovieDiv(movieData, index) {
    const baseImdbUri = "https://www.imdb.com/title/";
    var defaultImage = "./assets/default.jpg";
    var imgSrc = movieData.Poster == "N/A" ? defaultImage : movieData.Poster;
    // create image link Element
    var linkElement = document.createElement("a");
    linkElement.setAttribute("href", baseImdbUri + movieData.imdbID);
    linkElement.setAttribute("target", "_blank");
    var imageElement = document.createElement("img");
    imageElement.setAttribute("border", "0");
    imageElement.setAttribute("alt", movieData.Title + " movie poster");
    imageElement.setAttribute("src", imgSrc);
    imageElement.setAttribute("onerror", "this.src=" + defaultImage);
    linkElement.appendChild(imageElement);
    // create title element
    var titleElement = document
        .createElement("span")
        .appendChild(document.createTextNode(movieData.Title));
    var descriptionElement = document
        .createElement("span")
        .appendChild(
            document.createTextNode(
                movieData.Type.toUpperCase() + ", " + movieData.Year
            )
        );
    // create the div to hold them all
    var movieDiv = document.createElement("div");
    movieDiv.setAttribute("class", "movieBox");
    movieDiv.setAttribute("id", "movieBox" + index);
    movieDiv.appendChild(linkElement);
    movieDiv.appendChild(titleElement);
    movieDiv.appendChild(descriptionElement);
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

function getPoster(uri) {
    return fetch(baseUri, {
        method: "GET",
        headers: {
            "content-type": "image/jpeg"
        }
    });
}
