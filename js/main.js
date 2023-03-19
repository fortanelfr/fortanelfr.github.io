/* 
Calculadora de las palabras con más repeticiones en un texto.
Este algoritmo puede ser de utilidad en el area de Procesamiento del Lenguaje Natural, para intentar resumir un texto
por medio de una grafica cloud word.
Es importante filtar los palabras vacias(stopwords) las cuales carecen de significado, como artículos, pronombres, preposiciones, etc. 
Tambien es impoportante eliminar caracteres especiales como saltos de linea, puntos y comas.
Esta calculadora puede procesar texto en ingles o español. 
El texto utilizado en las pruebas viene de las paginas
https://distintaslatitudes.net/archivo/el-rock-en-latinoamerica-una-posible-nota-introductoria
*/

const texto = "../json/texto.json";
const stop = "../json/stopwords.json";

function contar_palabras(texto) {
    const palabras = Object.create(null);

    //Es de utilidad eliminar caracteres especiales como saltos de linea, puntos y comas.
    texto = texto.replace(/\n/g, ' ');
    texto = texto.replace(/\./g, ' ');
    texto = texto.replace(/\,/g, ' ');
    texto = texto.replace(/\:/g, ' ');
    texto = texto.replace(/\;/g, ' ');
    texto.split(' ').forEach(palabra => {
        //Ignoramos los strings vacios, ademas de los numeros
        if (!palabra == "" && isNaN(palabra)) {
            //Para normalizar un poco los datos quitamos las mayusculas
            palabra = palabra.toLowerCase()
            if (palabra in palabras) {
                palabras[palabra] += 1
            } else {
                palabras[palabra] = 1
            }
        }
    });
    return palabras

}

function eliminar_stopwords(palabras, idioma, remover) {
    if (remover) {
        let stopwords = sessionStorage.getItem(idioma)
        const resultado = palabras.filter(word => !stopwords.includes(word));
        return resultado
        //Verificamos si la palabra se encuentra en stopwords, en caso afirmativo se elimina

    } else {
        const resultado = palabras
        return resultado
    }
}

function top_n(texto, idioma, numero_palabras, remover = true) {
    palabras = contar_palabras(texto)
    //Ordenamos las palabras por numero de apariciones, sin embargo, al imprimir por console.log el objeto se ordena por orden alfabetico
    const palabras_ordenas = Object.keys(palabras).sort(function (a, b) { return palabras[b] - palabras[a] })

    const top_palabras = eliminar_stopwords(palabras_ordenas, idioma, remover);

    //En javascript podemos establecer la longitud de un objeto asignando un valor a su atributo length (No estoy seguro si es una buena practica pero funciona)
    top_palabras.length = numero_palabras


    /*En el paso de ordenamiento se obtuvo las palabras ordenas por aparición, sin embargo, se perdio el numero de apariciones de la palabra
      en este paso recuperamos las apariciones
    */
    const resultado = Object.create(null);
    top_palabras.forEach(palabra => {
        resultado[palabra] = palabras[palabra]
    });

    return resultado
}

//Obtenemos un color aletorio
function getDarkColor() {
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += Math.floor(Math.random() * 10);
    }
    return color;
}

function create_word(text, size, id, canvas, x = 0, y = 0) {
    let word = document.createElementNS("http://www.w3.org/2000/svg", "text");
    word.textContent = text;
    word.setAttributeNS(null, 'dominant-baseline', 'hanging')
    word.setAttributeNS(null, 'alignment-baseline', 'baseline')
    word.setAttributeNS(null, 'font-style', 'Impact')
    word.setAttributeNS(null, 'font-size', size)
    word.setAttributeNS(null, 'fill', getDarkColor())
    word.setAttributeNS(null, 'id', id)
    word.setAttributeNS(null, 'x', x)
    word.setAttributeNS(null, 'y', y)

    canvas.appendChild(word);
}



function ascending(list) {
    keys = Object.keys(list).sort(function (a, b) { return list[a] - list[b] })

    const result = Object.create(null);
    keys.forEach(word => {
        result[word] = list[word]
    });
    return result
}


function create_cloud(word_cloud, order) {
    var canvas = document.getElementById("canvas")
    let canvas_trans_x = canvas.getBoundingClientRect().left * .95

    //Eliminamos las palabras de calculos anteriores
    while (canvas.firstChild) {
        canvas.removeChild(canvas.lastChild);
    }
    var last_word;
    let new_Height = 0;
    let current_height = 0;


    //Contamos el numero de distintas repeticiones, de esta manera definiremos
    //los distintos tamaños
    const sizes = Object.create(null);
    let posicion = 0;
    for (let key in word_cloud) {
        if (!(word_cloud[key] in sizes)) {
            sizes[word_cloud[key]] = posicion
            posicion += 1
        }
    }


    //Es necesario agregar las palabras primero al dom, antes de poder calcular su posición final
    let categories = Object.keys(sizes).length - 1
    for (let key in word_cloud) {
        word_size = 60 * ((categories - sizes[word_cloud[key]]) / categories) + 20
        create_word(key, word_size, key, canvas)
    }

    //Las palabras vienen ordenas de manera descendente por default
    //Si el parametro order es asc, se cambia el orden a ascendente
    if (order == 'asc') {
        word_cloud = ascending(word_cloud)
    }


    //Calculamos las nuevas posiciones de las palabras
    for (let key in word_cloud) {
        word = canvas.getElementById(key);
        var bbox = word.getBoundingClientRect()
        if (last_word != null) {
            var l_bbox = last_word.getBoundingClientRect();
            // getBoundingCLientRect obtiene la posicion del objeto sobre toda la pagina, no sobre el canvas
            // debido a que el canvas fue transladado, getBoundingCLientRect regresa la posión del objeto con el desplazamiento
            // del canvas, por ello es necesario restar está translacción del objeto, para que no haya tanta separación entre las
            // palabras
            last_x = l_bbox.right - canvas_trans_x
            last_y = l_bbox.left - canvas_trans_x


            current_x = l_bbox.right + bbox.width - canvas_trans_x;
            if (current_x >= canvas.getBoundingClientRect().width) {
                current_height = new_Height
                word.setAttributeNS(null, 'transform', 'translate(' + 0 + ',' + current_height + ')')

            } else {
                word.setAttributeNS(null, 'transform', 'translate(' + last_x + ',' + current_height + ')')
            }
        }


        //Es necesario volver a calcular las coordenas
        bbox = word.getBoundingClientRect()
        if (bbox.bottom > new_Height) {
            new_Height = bbox.bottom
        }


        last_word = canvas.getElementById(key);

    }
}

function drawCloud() {
    //Actualizamos el texto a graficar
    sessionStorage.setItem('texto', text_area.value);
    let text_cloud = sessionStorage.getItem('texto')
    let idioma = document.getElementById("idioma");
    let num_palabras = document.getElementById("npalabras");
    let order_palabras = document.getElementById("order");

    //Obtenemos las n palabras más comunes
    word_cloud = top_n(text_cloud, idioma.value, num_palabras.value);

    //Dibujamos las palabras
    create_cloud(word_cloud, order_palabras.value);
}


//Iniciamos el proceso principal
swal({
    title: "Calculadora de las palabras con más repeticiones en un texto.",
    text: "Este simulador puede ser de utilidad para obtener los conceptos más importantes de un texto.\n\
           Las palabras con mayor repeticiones seran dibujadas en pantalla de forma ordena, donde el tamaño de la palabra está relacionado con numero de repeticiones en el texto.\n \
           El simulador se divide en tres tareas, cada una de las tareas cuenta con un parametro que el usuario puede modificar.\n\
           1.- La eliminación de palabras y/o caracteres que no aportan demasiada información al texto: El usuario podra seleccionar el idioma en el que se encuentra el texto,\
               ya que dependiendo del idioma, seran las palabras que se deben ser removidas del conteo, estás palabras son conocidas como stopwords.\n\
           2.- Obtener las n palabras más comunes: El usuario podra seleccionar cuantas palabras contar.\n \
           3.- Dibujar las palabras en la pantalla de manera ordenada: El usuario podra seleccionar el orden de dibujo, ascendente o descendente."
});




//Insertamos un texto prueba en la forma
let text_area = document.getElementById("texto_area")
fetch(texto)
    .then((response) => response.json())
    .then((data) => {
        sessionStorage.setItem('texto', data[0].texto);
    })

text_area.value = sessionStorage.getItem('texto')


//Obtenemos los stopwords
fetch(stop)
    .then((response) => response.json())
    .then((data) => {
        sessionStorage.setItem('ingles', data[0].ingles);
        sessionStorage.setItem('español', data[0].español);
    })

//Obtenemos los datos del parametros numero de palabras y lo mostramos
const value = document.getElementById("value_palabras")
const input = document.getElementById("npalabras")
value.textContent = input.value
input.addEventListener("input", (event) => {
    value.textContent = event.target.value
})


//Dibujamos el texto
drawCloud()



//Agregamos todas los posibles eventos que podrian volver a ejecutar el proceso de dibujo
let boton = document.getElementById("dibujar");
boton.addEventListener("click", drawCloud)

let idioma = document.getElementById("idioma");
idioma.addEventListener("click", drawCloud)

let num_palabras = document.getElementById("npalabras");
num_palabras.addEventListener("click", drawCloud)

let order_palabras = document.getElementById("order");
order_palabras.addEventListener("click", drawCloud)








