/////////////// Global Variables  ///////////////////////

//create list for keeping pokemons that have already been loaded
var usedPokemonIds = [];

// Dictionary for keeping all loaded pokemon data
var pokemonDict = {};

// number of Pokemon to load on first and additional load
var firstLoad = 12;
var numOnLoadMore = 6;

var lastPokemon = 718;

// names of characteristics that are going to be displayed
var characteristics = ['types', 'attack', 'defense', 'hp', 'sp_atk', 'sp_def', 
  'speed', 'weight', 'moves'];

/////////////// Helpers Functions ///////////////////////


// standard function for getting random int from a given interval
function randomFromInterval(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

// get type-name of selected pokemon
function getSelectedType(){
    $( "#typeSelector option:selected" ).each(function() {
      selectedType = $(this).text();
  });
    return selectedType;
}

// return string with html block for element with animation that will be
// displayed while ajax is loading
function imgAnimationHtml(id) {

  html= '<article class = "col-md-4 col-sm-6" id="imgAnimationElement' + id +'">' +
          '<div class="pokeDexCard" id="animationContainer">' +
            '<img src="http://fs146.www.ex.ua/get/618668286407/237121151/81.gif"' +
            ' class="img-responsive center-block" id="animation" />' +
          '</div>' +
        '</article>';
  
  return html;
  }

// make additional information normal
function makeInfoUnfixed(){
  var windowHeight = window.innerHeight;
  if (windowHeight < 525) {
      $('#extraInfo').css('position', 'relative').css('left', 'auto').css('right','auto');
  } else {
    $('#extraInfo').css('position', 'fixed').css('left', '60%').css('right','5%');
    }
}


////////////////// Main Functions //////////////////

// get a random pokemon that hadn't been picked yet
function randomPokemon(usedPokemonIds, min, max){
  // pick a random pokemon
  var id = randomFromInterval(min, max);
  
  //avoid infinite loop
  if (usedPokemonIds.length < lastPokemon) {
    // check if it isn't in the list already
    while (usedPokemonIds.indexOf(id) != -1){
      id = randomFromInterval(min, max);
    }
      // ad pokemon to list of pokemons that has already been loaded
    usedPokemonIds.push(id);
    return id;
  } else {
    throw "All pokemons have been loaded, You can not load more";
  }

}

// create responsive picture of a pokemon with a certain id 
//and append it to a certain element
function insertPicture(id, element){
  url = 'http://pokeapi.co/media/img/' + id +'.png';
  element.append('<div class = "imgDiv center-block"><img src =' + url + 
    ' class = "img-responsive center-block" /></div>');
}

// create pokeCard of given pokemon id and append it 
//to a given element
function createPokeCard(id, element){
  $.ajax({
    url: 'http://pokeapi.co/api/v1/pokemon/' + id,
    type: 'GET',
    dataType: 'jsonp',
    async: true,
    // show "loading" animation
    beforeSend: function() {
      element.append(imgAnimationHtml(id));
     },
    // remove "loading" animation
    complete: function() {
      $('#imgAnimationElement'+id).remove();
    },
    success: function(data) {
      //create main container for centain Pokemon card
      element.append('<article class = "col-md-4 col-sm-6 cardContainer" id =' + 
        id +'></article>');

      // asign certain id to element for later use
      element = $('#'+id);
      element.append("<div class = 'col-md-12 pokeDexCard center-block id" +
       id + "'></div>");

      element = $('div.id'+id);
      // insert Picture of a Pokemon
      insertPicture(id, element);
      // insert name of a Pokemon
      element.append("<h3>" + data.name + "</h3>");

      // add buttons with types of this Pokemon
      $.each(data.types, function(index, value){
        element.append('<div ' + "class = 'typeButton center-block " + 
          capitalizeFirstLetter(value.name) + "'>" + 
          value.name.toUpperCase() + '</button');
      });

      //add data of this Pokemon to the dictionary
      pokemonDict[id] = data;

      //call function that filters Pokemons based on their types and type 
      //that was selected by the user
      showCertainType(getSelectedType());
    }
  });
}

// load data for a given pokemon in a special element
function showDetails(id){
      var htmlElement = $('#pDetailsTable');
      data = pokemonDict[id];

      // empty current details data that is displayed
      $('#pDetails').empty();
      htmlElement.empty();
      
      // atribute name is needed for referencing to it when filtering Pokemons
      // using showCertainType function
      $('#pDetails').attr('name', id);

      //insert name and id
      $('#pDetails').append('<h3>' + data.name + ' # ' + id + '</h3>');
      
      // insert picture
      insertPicture(id, $('#pDetails'));

      // insert all other characteristics
      
      // go through ecery characteristic
      $.each(characteristics, function(index, value){

        if (value == 'types'){
          // add "Type" row
          htmlElement.append('<tr><td><p><strong>Type</strong></p></td><td><p id = "types"></p></tr>');
          
          // add types to next cell
          $.each(data[value], function(index, value){

            $('html #types').append(value.name.toUpperCase() + ' ');
          
          });

        } else if (value == 'moves'){
            // insert row with the NUMBER of moves
            htmlElement.append('<tr><td><p><strong>' + capitalizeFirstLetter(value) + ' </strong></p></td><p><td>'+ data[value].length + '</p></tr>');
        } else {
          // add all other characteristics
          htmlElement.append('<tr><td><p><strong>' + capitalizeFirstLetter(value) + ' </strong></p></td><td><p>'+ data[value] + '</p></td></tr>');
        }

      });

}


// show pokemons that are of a certain type

function showCertainType(type) {

  // go through every Pokemon card
  $.each($('.cardContainer'), function(index, card){

    var elementToHide = $(card);
    var wrongType = 0;

    if (type == 'Any') {
      // show element
      elementToHide.css('display', 'block');

    } else {
        // variable for keeping type of a Pokemon of this card
        var types = [];
        // id of this Pokemon
        pokemonID = $(card).attr('id');

        typesObj = pokemonDict[pokemonID].types;
        // go through each Types object of this Pokemon
        $.each(typesObj, function(index, typeArray){
          // add name of the Type to "types" array
          types.push(typeArray.name);
        });

        // go through all types of a given Pokemon
        $.each(types, function(index, typeName){

          if ( capitalizeFirstLetter(typeName) != type) {
            //count wrong types of this Pokemon
            wrongType += 1;
          } else {
            elementToHide.css('display', 'block');

          }
        });
        if (wrongType == types.length) {

          elementToHide.css('display', 'none');
          // if we filter out Pokemon whose additional info was displayed - 
          // - hide this info
          if ($('#pDetails').attr('name') == elementToHide.attr('id')) {

            $('#pDetailsTable').empty();
            $('#pDetails').empty();
          }
        }
        
      }
    
  });
}

// get all possible types of pokemons
function getTypes(){
    $.ajax({
    url: 'http://pokeapi.co/api/v1/type/?limit=999',
    type: 'GET',
    dataType: 'jsonp',
    async: true,
    success: function(data) {
      var types = [];

      $.each(data.objects, function(index, value) {

        types.push(value.name);
        $('select.form-control').append("<option>" + value.name + "</option>");
      });
    }
  });
}

// load given number of pokemons (articles)
function pokeLoad(num){

  var htmlElement = $('#pokedex');

  for (var i = 0; i < num; i++){
    // check if all pokemons where already loaded
    if (usedPokemonIds.length >= lastPokemon) {

      html = '<div class = "col-md-12" id = "noMorePokemons"><h3>No More Pokemons to Load</h3></article>';
      $('#buttonSection').append(html);
      $('#loadMore').remove();
      break;

   } else {
    var id = randomPokemon(usedPokemonIds, 1, lastPokemon);
    createPokeCard(id, $(htmlElement));
    }
  }
}


//////////////////////////////////
///////////// initial load ///////////////
$('document').ready(pokeLoad(firstLoad));
$('document').ready(getTypes());
$('document').ready(makeInfoUnfixed());

////////////   Listeners  ////////////////
// filter Pokemons
$('#typeSelector').change(function(){
  showCertainType(getSelectedType());
});

// show additional Info
$('html').on('click', 'section.row article', function(){
  id = $(this).attr('id');
  showDetails(id);
});

// Close additional Info
$('html').on('click', '#extraInfo', function(){
  $('#pDetailsTable').empty();
  $('#pDetails').empty();
});

// Load More
$('#loadMore').click(function(){
  pokeLoad(numOnLoadMore);
});

//animate poketcards

$('html').on('mouseenter', 'section.row article', function(){
            $(this).animate({'top':'-8px'});
        });
$('html').on('mouseleave', 'section.row article', function(){

            $(this).animate({'top':'0px'});
  });

// change additional info on resize
window.addEventListener("resize",makeInfoUnfixed,false);


