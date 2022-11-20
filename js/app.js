//Variables Globales
const d = document,
    w = window,
    ls = window.localStorage,
    n = navigator;

//Variables Globales del DOM
const $formPersonas = d.getElementById("formulario-personas"),
    $btnFormPersonas = d.querySelector(".btn-form"),
    $divEstudiante = d.querySelector(".div-estudiante"),
    $divProfesor = d.querySelector(".div-profesor"),
    $tempEst = d.getElementById("template-estudiante").content,
    $tempPro = d.getElementById("template-profesor").content;
    // console.log($select);
    
const estudiantes = [];
const profesores = [];
let regExp = "";
let mensaje = "";


//Capturando Datos 
d.addEventListener("submit", (e) => {
    e.preventDefault();

    //Formulario Personas
    if(e.target.matches("#formulario-personas")){
        const $select = $formPersonas.querySelectorAll("select"),
            $inputs = $formPersonas.querySelectorAll("input");
        
        const datosPersonas = new FormData($formPersonas);
        const [tipo, nombre, id, curso, edad] = datosPersonas.values();

        //Dando formato a los valores
        const nombreM = nombre.toLocaleLowerCase(),
            idM = id.toLocaleLowerCase(),
            cursoM = curso.toLocaleLowerCase();
    
        //Ejecuntando validación de datos
        if($select){
            regExp = /inicial/ig;
            mensaje = "Opción no válida"
            // console.log("Validacion select");
            if(!validarError($select, regExp, mensaje)) return;   
        };
    
        if(estudiantes.length > 0 && tipo === "estudiante"){
            regExp = new RegExp(`${cursoM}${idM}`, "ig");
            mensaje = `El código "${id}" ingresado ya existe en el curso "${curso}"`;
            // console.log("Validacion codigo");
            if(!validarError(estudiantes, regExp, mensaje, tipo)) return;
        };
    
        if(profesores.length > 0 && tipo === "profesor"){
            regExp = new RegExp(`${cursoM}`, "ig");
            mensaje = `El curso "${curso}" ya fue asignado a un Profesor`;
            // console.log("Validacion codigo");
            if(!validarError(profesores, regExp, mensaje, tipo)) return;
        };
    
        //Creando Objetos
        if(tipo === "estudiante"){
            const newEstudiante = new Estudiante(nombreM, idM, cursoM, edad);
            estudiantes.push(newEstudiante);
            Persona.pintarPersonaDOM(estudiantes, tipo);
        };
        
        if(tipo === "profesor"){
            const newProfesor = new Profesor(nombreM, idM, cursoM);
            profesores.push(newProfesor);
            Persona.pintarPersonaDOM(profesores, tipo);
        };

        //Actualizando notas de la sección estudiante
        if(estudiantes.length > 0){
            estudiantes.forEach(el => {
                Object.entries(el.mostrarNotas).forEach(item => {
                    if(item.length > 0){
                        const $seccion = d.getElementById(`${el.curso}${el.id}`);
                        
                        let materia = item[0],
                            nota = item[1].toString();
    
                        pintarNotaDOM($seccion, materia, nota);
                    };
                });
            });
        };
    };


    //Formulario de calificaciones
    if(e.target.matches(".form-calificar")){
        const $seccionEstudiante = d.querySelectorAll(".seccion-estudiante");

        const notasEstudiante = new FormData(e.target);
        const [materia, estudiante, nota] = notasEstudiante.values();

        if(materia){
            const nodoHTML = e.target.querySelectorAll(`select[name="materia"]`);
            regExp = new RegExp(`ini-mat`, "ig");
            mensaje = "Seleccione una materia válida";

            if(!validarError(nodoHTML, regExp, mensaje, "estudiante")) return;
        }
        
        if(estudiante) {
            const nodoHTML = e.target.querySelectorAll(`select[name="estudiante"]`);

            regExp = new RegExp(`ini-est`, "ig");
            mensaje = "Seleccione un estudiante de la lista";

            if(!validarError(nodoHTML, regExp, mensaje)) return;
        };

        $seccionEstudiante.forEach(seccion => {
            regExp = new RegExp(`${seccion.id}`, "ig");

            if(regExp.test(estudiante)){
                estudiantes.forEach(el => {   
                    if(seccion.id === `${el.curso}${el.id}`){
                        el.agregarNotas(materia, nota);
                    };
                });

                pintarNotaDOM(seccion, materia, nota);
            }; 
        });
    };
});


//Función de validación
function validarError (nodoHTML, regExp, mensaje, tipo){
    let estado;
    // console.log(regExp);

    for(let i = 0; estado !== true || i <= (nodoHTML.length - 1); i++){
        const $divError = d.querySelector(".error") || d.createElement("div");
        const $inputs = $formPersonas.querySelectorAll("input");
        
        let item = nodoHTML[i];
        
        if(regExp.test(item.value)){
            $divError.textContent = mensaje;
            $divError.classList.add("error");
            $divError.classList.remove("d-none");
            $divError.style.width = `${item.offsetWidth}px`;
            item.after($divError);
            return estado = false;
        } else if(regExp.test(`${item.curso}${item.id}`) || regExp.test(item.curso)){
            $divError.textContent = mensaje;
            $divError.classList.add("error");
            $divError.classList.remove("d-none");
            $inputs.forEach(input => {
                if(input.value.toLocaleLowerCase() === item.id && tipo === "estudiante"){
                    $divError.style.width = `${input.offsetWidth}px`;
                    input.after($divError);  
                } else if(input.value.toLocaleLowerCase() === item.curso && tipo === "profesor"){
                    $divError.style.width = `${input.offsetWidth}px`;
                    input.after($divError);  
                };
            });

            return estado = false;
        };

        if($divError.matches(".error")){
            d.querySelector(".error").remove($divError);
            estado = true;
        } else {
            estado = true;
        };
    };

    return estado;
};


//Creando Constructor de Personas
class Persona {
    constructor(nombre, id, curso){
        this.nombre = nombre,
        this.id = id,
        this.curso = curso
    };
        
    static pintarPersonaDOM(arrayPersonas, tipo){
        // console.log("Pinta Personas en el DOM");

        if(tipo === "estudiante"){
            $divEstudiante.textContent = "";
            const fragment = d.createDocumentFragment();

            arrayPersonas.forEach(item => {
                fragment.appendChild(item.seccionEstudiante());
            });

            $divEstudiante.appendChild(fragment);
        };    

        if(tipo === "profesor"){
            $divProfesor.textContent = "";
            const fragment = d.createDocumentFragment();

            arrayPersonas.forEach(item => {
                fragment.appendChild(item.seccionProfesor());    
            }); 

            $divProfesor.appendChild(fragment);
        };    
    };
};


//Constructor de estudiantes
class Estudiante extends Persona {
    constructor (nombre, id, curso, edad){
        super(nombre, id, curso);
        this.edad = edad;
        this.notaFinal;
    };
    
    #notas = {}; 
    #estado = false;
    
    set cambiarEstado(nota){
        (nota >= 3) 
        ? this.#estado = true
        : this.#estado = false;
    };

    get mostrarNotas(){
        return this.#notas;
    };

    get mostrarEstado(){
        return this.#estado;
    };
    
    agregarNotas(materia, nota){
        this.#notas[materia] = parseFloat(nota);
    };

    calcularNotaFinal(){
        let sumatoria = Object.values(this.#notas).reduce((suma, valor, indice = 0, vector) => {
            return ((suma + valor));
        });

        this.notaFinal = (sumatoria/4).toFixed(1);
        this.cambiarEstado = this.notaFinal
    };

    validarEstado(seccion){
        if(this.mostrarEstado){
            const $pEstado = seccion.querySelector(`.estado`);
            
            $pEstado.classList.remove("estado-false");
            $pEstado.classList.add("estado-true");
            $pEstado.textContent = "Aprobado"
        } else {
            const $pEstado = seccion.querySelector(`.estado`);
            
            $pEstado.classList.add("estado-false");
            $pEstado.classList.remove("estado-true");
            $pEstado.textContent = "Reprobado"
        };
    };

    seccionEstudiante(){
        const $clone = $tempEst.cloneNode(true);

        $clone.querySelector(".seccion-estudiante").id = `${this.curso}${this.id}`;
        $clone.querySelector(".curso").textContent = `Curso ${this.curso}`;
        $clone.querySelector(".id").textContent = `${this.curso}${this.id}`;
        $clone.querySelector(".nombre").textContent = `${this.nombre}`;
        $clone.querySelector(".edad").textContent = `${this.edad} Años`;

        return $clone;
    };
};


//Constructor de profesores
class Profesor extends Persona {
    seccionProfesor(){
        const $clone = $tempPro.cloneNode(true);
        
        $clone.querySelector(".seccion-profesor").id = `${this.curso}`;
        $clone.querySelector(".curso").textContent = `Curso ${this.curso}`;
        $clone.querySelector(".id").textContent = `${this.curso}${this.id}`;
        $clone.querySelector(".nombre").textContent = `${this.nombre}`;        

        return $clone;
    };
};


//Formulario dinámico segun opción seleccionada
d.addEventListener("click", (e) => {
    const $inputs = $formPersonas.querySelectorAll("input");

    //Evento opción Profesor
    if(e.target.name === "tipo" && e.target.value === "profesor"){
        $inputs.forEach(input => {
            if(input.name === "edad"){
                $formPersonas.removeChild(input);
            };
        });
    };
    
    //Evento opción Estudiante
    if(e.target.name === "tipo" && e.target.value === "estudiante" && $inputs.length <= 3){
        const $inputEdad = d.createElement("input");
        
        $inputEdad.setAttribute("type", "text");
        $inputEdad.setAttribute("name", "edad");
        $inputEdad.setAttribute("placeholder", "Ingrese edad del estudiante");
        $inputEdad.setAttribute("value", "5");
        $inputEdad.setAttribute("pattern", "^[0-9]{1,2}$");
        $inputEdad.setAttribute("title", "Ingrese una edad válida");
        $inputEdad.setAttribute("required", "");
        $inputs[$inputs.length - 1].after($inputEdad);
    };

    //Evento Crear lista
    if(e.target.matches(".btn-lista")){
        const $nodo = e.target.parentNode;

        creandoListaEstudiantes($nodo);
        // console.log(e.target.nextElementSibling);
    } else if(e.target.matches(".btn-actualizar")){
        const $nodo = e.target.parentNode;

        creandoListaEstudiantes($nodo);
    };
});


//Creando lista de estudiantes en la seccion profesor
function creandoListaEstudiantes(nodo){
    const $listaEstudiantes = nodo.querySelector(".lista-estudiantes"),
        $divWarn = d.querySelector(".div-mensaje");
    let estCurso = estudiantes.filter(el => el.curso === nodo.id);
    let difIndex = estCurso.length - ($listaEstudiantes.length - 1);
    // console.log(estCurso);

    if(estCurso.length !== 0){
        const $fragment = d.createDocumentFragment();
        
        estCurso.forEach(el => {
            let codigo = `${el.curso.toUpperCase()}${el.id.toUpperCase()}`;

            //Boton Cargar Lista
            if(nodo.id === el.curso && $listaEstudiantes.length === 1){
                // console.log("Hay estudiantes en la lista");
                const $opcion = d.createElement("option");
                
                $opcion.setAttribute("data-id", `${codigo}`);
                $opcion.textContent = `${el.nombre} - ${codigo}`;
                $fragment.appendChild($opcion);
                
                nodo.querySelector(".btn-lista").setAttribute("disabled", "");
                nodo.querySelector(".btn-actualizar").removeAttribute("disabled");
                return
            };
            
            //Boton Actualizar Lista
            if (nodo.id === el.curso && difIndex !== 0){
                const $opciones = $listaEstudiantes.querySelectorAll(`[data-id="${codigo}"]`);

                if($opciones.length === 0){
                    // console.log("Hay nuevos estudiantes por agregar a la lista");
                    const $opcion = d.createElement("option");
        
                    $opcion.setAttribute("data-id", `${codigo}`);
                    $opcion.textContent = `${el.nombre} - ${codigo}`;
                    $fragment.appendChild($opcion);
                };
            } else if(difIndex === 0){
                // console.warn("La lista ya está actualizada");
                $divWarn.textContent = `La lista del curso ${nodo.id} ya está actualizada`;
                $divWarn.classList.add("div-warn");
            };
        });
        
        $listaEstudiantes.appendChild($fragment);
    } else {
        // console.error("No hay estudiantes en la lista");
        $divWarn.textContent = `No hay estudiantes del curso ${nodo.id}`;
        $divWarn.classList.add("div-warn");
    };

    setTimeout(() => {
        $divWarn.textContent = "";
        $divWarn.classList.remove("div-warn");
    }, 3000);
};


//Función pintar nota en el DOM
function pintarNotaDOM(seccion, materia, nota){
    const $pMateria = seccion.querySelector(`[data-name="${materia}"]`),
        $pNotaFinal = seccion.querySelector(".nota-final p");

    (nota.length === 1)
    ? $pMateria.textContent = `${nota},0`:
    $pMateria.textContent = `${nota}`;

    calificar(seccion);

    estudiantes.forEach(el => {
        if(seccion.id === `${el.curso}${el.id}`){
            $pNotaFinal.textContent = el.notaFinal;
        };

        el.validarEstado(seccion);
    });
};


//Función Caliicar
function calificar(seccion){
    estudiantes.forEach(el => {
        let codigo = `${el.curso}${el.id}`;
        if(seccion.id === codigo){
            el.calcularNotaFinal();
        };
    });
};


//Función para capitalizar Textos
function capitalizarTexto(texto){
    let arrayTexto = texto.split(" ");
    nuevoArr = arrayTexto.map(el => {
        let primeraLetra = el.charAt(0).toUpperCase(),
            textoResiduo = el.slice(1);
        
        return primeraLetra + textoResiduo;
    });

    return nuevoArr.join(" ");
};
