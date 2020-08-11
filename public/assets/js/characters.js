let charactersSelected = [];
let charactersLoaded = [];
let charactersToLoadIndex = 9;
let charactersLoadedIndex = 1;

let totalPagesLoadedJSON = 1;
let totalPagesToLoadJSON = 1;
let totalPages = 1;
let currentPage = 1;

// The initialisation of the web application
$("#selectionCompleted").css("visibility", "hidden");
loadFirstPage();

/**
 * This event handler is responsible for triggering the appropriate functions in order 
 * to load up the next characters from the SWAPI API.
 * @author Maksymilian Kawula
 */
$("#arrowRight").click(function () {
    if (currentPage != totalPages) {
        charactersToLoadIndex += 9;
        if ((charactersToLoadIndex + 9) > charactersLoaded.length) {
            loadNextPageJSON();
        }
        loadNextPage();
        $("#textPages").html("Page " + currentPage + " / " + totalPages);
    }
    checkArrows();
})

/**
 * This event handler is responsible for triggering the appropriate functions in order 
 * to load up previous nine characters from the SWAPI API.
 * @author Maksymilian Kawula
 */
$("#arrowLeft").click(function () {
    if (currentPage != 1) {
        charactersToLoadIndex -= 9;
        loadPreviousPage();
        $("#textPages").html("Page " + currentPage + " / " + totalPages);
    }
    checkArrows();
})

/**
 * This event handler is responsible for taking appropriate actions once RESET 
 * button is clicked, such as emptying array of selected characters, enabling all the 
 * characters' buttons and changing instructions.
 * @author Maksymilian Kawula
 */
$("#resetBtn").click(function () {
    charactersSelected = [];
    $("#grid button").removeClass('btn-success').addClass('btn-light').prop('disabled', false);
    checkInstruction();
})

/**
 * This event handler is responsible for converting array with selected characters 
 * into CSV file format and saving it on the user's computer.
 * @author Maksymilian Kawula
 */
$("#downloadBtn").click(function () {
    // Checking if a specific value is array type variable
    const validation = (key, value) => Array.isArray(value) ? arrayToText(value) : value;
    // Gathering keys
    const header = Object.keys(charactersSelected[0]);
    let csv = "";
    // Mapping values to the keys
    csv = charactersSelected.map(row => header.map(fieldName => JSON.stringify(row[fieldName], validation)).join(','));
    csv.unshift(header.join(','));
    csv = csv.join('\r\n');
    let hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = 'characters.csv';
    hiddenElement.click();
})


/**
 * This function converts an array into the text and separate content with commas.
 * @param {Array} array - The array for conversion
 * @returns {String} text - The array content in the form of text
 * @author Maksymilian Kawula
 */
function arrayToText(array) {
    let text = "";
    for (const val of array) {
        text += val + " , ";
    }
    return text;
}

/**
 * This function is responsible for showing and hiding arrows depending on the current page open.
 * @author Maksymilian Kawula
 */
function checkArrows() {
    if (currentPage == 1) {
        $("#arrowRight").show();
        $("#arrowLeft").hide();
    } else if (currentPage == totalPages) {
        $("#arrowRight").hide();
        $("#arrowLeft").show();
    } else {
        $("#arrowRight").show();
        $("#arrowLeft").show();
    }
}

/**
 * This function is responsible for checking the condition of the number of characters 
 * selected and displaying an appropriate instruction to the user.
 * @author Maksymilian Kawula
 */
function checkInstruction() {
    if (charactersSelected.length == 0) {
        $('#textInstructions').html("SELECT 3 CHARACTERS!");
        $("#selectionCompleted").css("visibility", "hidden");
    } else {
        let text = "";
        // Gathering the names of selected characters
        for (let x in charactersSelected) {
            text += charactersSelected[x]["name"].toUpperCase();
            if (x != 2) {
                text += ", ";
            }
        }
        $('#textInstructions').html("YOU HAVE SELECTED " + text);
        if (charactersSelected.length == 3) {
            $("#selectionCompleted").css("visibility", "visible");
            $("#grid button").prop('disabled', true);
        }
    }
}

/**
 * This function is responsible for gathering data of the selected characters 
 * and saving it in the array with selected characters.
 * @param {String} character - The name of the character
 * @author Maksymilian Kawula
 */
function addCharacter(character) {
    (async () => {
        await fetch('https://swapi.dev/api/people/?search=' + character)
            .then(res => res.json())
            .then((data) => {
                charactersSelected.push(data["results"][0]);
            })
            .catch(err => { throw err });

        $('#' + character.replace(/\s/g, "-")).removeClass('btn-light').addClass('btn-success').prop('disabled', true);
        checkInstruction();
    })();
}

/**
 * This function is responsible for gathering information of two first JSON pages 
 * from the SWAPI API and creation of the first page with the first nine characters.
 * @author Maksymilian Kawula
 */
function loadFirstPage() {
    (async () => {
        await fetch('https://swapi.dev/api/people/?page=1')
            .then(res => res.json())
            .then((data) => {
                let grid = '<div id="' + currentPage + '" class="center_div container text-center">';
                let counter = 1;
                let name;
                // Looping through all the characters from the first page
                $.each(data["results"], function (i, val) {
                    charactersLoaded.push(val["name"]);
                    // Creating 3 columns for each row
                    if (charactersLoadedIndex <= charactersToLoadIndex) {
                        name = val["name"];
                        if (counter == 1) {
                            grid += '<div class="row">';
                        }
                        grid += '<div class="col input-container"><button id="' + name.replace(/\s/g, "-") + '" type="button" class="btn btn-light btn-lg btn-block" onclick="addCharacter(\'' + name + '\')"><span class="fa fa-user" aria-hidden="true"></span><p>' + name.toUpperCase() + '</p></button></div>';
                        if (counter == 3) {
                            grid += '</div>';
                            counter = 1;
                        } else {
                            counter++;
                        }
                        charactersLoadedIndex++;
                    }
                });
                grid += '</div>';
                $('#grid').append(grid);
                totalPages = Math.ceil(data["count"] / 9);
                if (data["next"] != null) {
                    totalPagesToLoadJSON++;
                }
            })
            .catch(err => { throw err });

        await loadNextPageJSON();
        checkArrows();
        $("#textPages").html("Page " + currentPage + " / " + totalPages);
    })();
}

/**
 * This function is responsible for loading up the next JSON page and saving 
 * all the data into an array of loaded characters.
 * @author Maksymilian Kawula
 */
function loadNextPageJSON() {
    if (totalPagesToLoadJSON > totalPagesLoadedJSON) {
        fetch('https://swapi.dev/api/people/?page=' + totalPagesToLoadJSON)
            .then(res => res.json())
            .then((data) => {
                $.each(data["results"], function (i, val) {
                    if (!charactersLoaded.includes(val["name"])) {
                        charactersLoaded.push(val["name"]);
                    }
                });
                totalPagesLoadedJSON++;
                if (data["next"] != null) {
                    totalPagesToLoadJSON++;
                }
            })
            .catch(err => { throw err });
    }
}

/**
 * This function is responsible for the creation of the next page with another nine characters' buttons and hiding the current page.
 * @author Maksymilian Kawula
 */
function loadNextPage() {
    if ($('#' + (currentPage + 1)).length == 0) {
        // Checking if the page is only hidden or not created yet
        if (charactersLoaded.length != charactersToLoadIndex) {
            let counter = 1;
            let name;
            currentPage++;
            let grid = '<div id="' + currentPage + '" class="center_div container text-center">';
            for (; charactersLoadedIndex <= charactersToLoadIndex; charactersLoadedIndex++) {
                if (counter == 1) {
                    grid += '<div class="row">';
                }
                if ((typeof charactersLoaded[charactersLoadedIndex - 1] === 'undefined')) {
                    grid += '<div id="emptyCell" class="col input-container"></div>';
                } else {
                    name = charactersLoaded[charactersLoadedIndex - 1];
                    grid += '<div class="col input-container"><button id="' + name.replace(/\s/g, "-") + '" type="button" class="btn btn-light btn-lg btn-block" onclick="addCharacter(\'' + name + '\')"><span class="fa fa-user" aria-hidden="true"></span><p>' + name.toUpperCase() + '</p></button></div>';
                }
                if (counter == 3) {
                    grid += '</div>';
                    counter = 1;
                } else {
                    counter++;
                }
            }
            grid += '</div>';
            // Hiding the current page
            $('#' + (currentPage - 1)).hide();
            $('#grid').append(grid);
        }
    } else {
        $('#' + currentPage).hide();
        $('#' + (currentPage + 1)).show();
        currentPage++;
    }
    checkInstruction();
}

/**
 * This function is responsible for hiding the current page and showing up the previous page to the user.
 * @author Maksymilian Kawula
 */
function loadPreviousPage() {
    $('#' + currentPage).hide();
    $('#' + (currentPage - 1)).show();
    currentPage--;
    checkInstruction();
}