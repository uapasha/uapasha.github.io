/////////////// Helpers functions ///////////////////////

//create list for keeping pokemons that have already been loaded
var usedPokemonIds = [];
var pokemonDict = {}
var characteristics = ['types', 'attack', 'defense', 'hp', 'sp_atk', 'sp_def', 'speed', 'weight', 'moves']
var selectedType = 'Any'
function imgAnimationHtml(id) {
  html= '<article class = "col-md-4 col-sm-6" id="imgAnimationElement' + id +'">' +
          '<div class="pokeDexCard" id="animationContainer">' +
            '<img src="http://fs146.www.ex.ua/get/618668286407/237121151/81.gif" class="img-responsive center-block" id="animation" />' +
          '</div>' +
        '</article>'
  return html
  }

// standard function for getting random int from a given interval
function randomFromInterval(min, max){
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}

// get name of selected type
function getSelectedType(){
    $( "#typeSelector option:selected" ).each(function() {
      selectedType = $(this).text();
  });
    return selectedType
}


// make additional information normal
function makeInfoUnfixed(){
  var windowHeight = window.innerHeight;
  if (windowHeight < 525) {
      $('#extraInfo').css('position', 'relative').css('left', 'auto').css('right','auto')
  } else {
    $('#extraInfo').css('position', 'fixed').css('left', '60%').css('right','5%')
    };
}


////////////////// Main Functions //////////////////

// get a random pokemon that hadn't been picked yet
function randomPokemon(usedPokemonIds, min, max){
  // pick a random pokemon
  var id = randomFromInterval(min, max);
  // check if it isn't in the list already
  while (usedPokemonIds.indexOf(id) != -1){
    id = randomFromInterval(min, max);
  }
  // ad pokemon to list of pokemons that has already been loaded
  usedPokemonIds.push(id);
  return id
}

// create responsive picture of a pokemon with a certain id 
//and append it to a certain element
function insertPicture(id, element){
  url = 'http://pokeapi.co/media/img/' + id +'.png';
  element.append('<div class = "imgDiv center-block"><img src =' + url + ' class = "img-responsive center-block" /></div>');
}

// create pokeCard of given pokemon id and append it 
//to a given element
function createPokeCard(id, element){
  $.ajax({
    url: 'http://pokeapi.co/api/v1/pokemon/' + id,
    type: 'GET',
    dataType: 'jsonp',
    async: true,
    beforeSend: function() {
      element.append(imgAnimationHtml(id));
     },
    complete: function() {
      $('#imgAnimationElement'+id).remove();
    },
    success: function(data) {

      // asign certain id to element for later use
      element.append('<article class = "col-md-4 col-sm-6 cardContainer" id =' + id +'></article>')

      element = $('#'+id)
      element.append("<div class = 'col-md-12 pokeDexCard center-block id" + id + "'></div>");
      element = $('div.id'+id);
      // insert Picture of a Pokemon
      insertPicture(id, element);
      // insert name of a Pokemon
      element.append("<h3>" + data.name + "</h3>");
      // add buttons with types of this pokemon
      $.each(data.types, function(index, value){
        element.append('<div ' + "class = 'typeButton center-block " + capitalizeFirstLetter(value.name) + "'>" + value.name.toUpperCase() + '</button');
      })
      pokemonDict[id] = data;
      showCertainType(getSelectedType());
    }
  })
}

// load date for a given pokemon in a special element
function showDetails(id){
      var htmlElement = $('#pDetailsTable');
      data = pokemonDict[id];
      $('#pDetails').empty();
      $('#pDetails').attr('name', id);
      htmlElement.empty();

      //insert name and id
      $('#pDetails').append('<h3>' + data.name + ' # ' + id + '</h3>');
      

      // insert picture
      insertPicture(id, $('#pDetails'));

      // insert all other characteristics
      
      $.each(characteristics, function(index, value){
        if (value == 'types'){
          htmlElement.append('<tr><td><p><strong>Type</strong></p></td><td><p id = "types"></p></tr>')
          $.each(data[value], function(index, value){
            $('html #types').append(value.name.toUpperCase() + ' ');
            //htmlElement.append('<tr><td><p> Type </p></td><p><td>'+ value.name + '</p></tr>');
          });
        } else if (value == 'moves'){
            htmlElement.append('<tr><td><p><strong>' + capitalizeFirstLetter(value) + ' </strong></p></td><p><td>'+ data[value].length + '</p></tr>');
        }
        else {
          htmlElement.append('<tr><td><p><strong>' + capitalizeFirstLetter(value) + ' </strong></p></td><td><p>'+ data[value] + '</p></td></tr>');
        }
      })

};

// show pokemons that are of a certain type

function showCertainType(type) {

  $.each($('.cardContainer'), function(index, card){
    elementToHide = $(card);
    wrongType = 0
    if (type == 'Any') {
      elementToHide.css('display', 'block');
    } else {
      types = []
      pokemonID = $(card).attr('id');
      typesObj = pokemonDict[pokemonID].types
      $.each(typesObj, function(index, typeArray){
        types.push(typeArray.name);
      })

      $.each(types, function(index, typeName){

        if ( capitalizeFirstLetter(typeName) != type) {
          wrongType += 1;
        } else {
          elementToHide.css('display', 'block');

        }
      });
      if (wrongType == types.length) {
        elementToHide.css('display', 'none');
        if ($('#pDetails').attr('name') == elementToHide.attr('id')) {
          $('#pDetailsTable').empty();
          $('#pDetails').empty();
        }
      }
      
    }
    
  })
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
      })
    }
  })
}

// load given number of pokemons (articles)
function pokeLoad(num){
  var htmlElement = $('#pokedex')
  for (var i = 0; i < num; i++){
    id = randomPokemon(usedPokemonIds, 1, 718);
    createPokeCard(id, $(htmlElement));
  }
}

//////////////////////////////////
// initial load
$('document').ready(pokeLoad(12));
$('document').ready(getTypes());
$('document').ready(makeInfoUnfixed());

////////////   Listeners  ////////////////
$('#typeSelector').change(function(){
  showCertainType(getSelectedType());
})

$('html').on('click', 'section.row article', function(){
  id = $(this).attr('id');
  showDetails(id);
})

$('#loadMore').click(function(){
  pokeLoad(6);
})

$('html').on('click', '#extraInfo', function(){
  $('#pDetailsTable').empty();
  $('#pDetails').empty();
})

//animate poketcards

$('html').on('mouseenter', 'section.row article', function(){
            $(this).animate({'top':'-8px'});
        });
$('html').on('mouseleave', 'section.row article', function(){

            $(this).animate({'top':'0px'});
  });

// change additional info on resize
window.addEventListener("resize",makeInfoUnfixed,false);


