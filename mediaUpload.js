//variabelen
let queuedMediaArray = [],
savedForm = document.querySelector("#saved-form"),
queuedForm = document.querySelector("#queued-form"),
saveDiv = document.querySelector(".saved-div"),
queuedDiv = document.querySelector(".queued-div"),
inputDiv = document.querySelector(".input-div"),
input = document.querySelector(".input-div input"),
serverMessage = document.querySelector(".server-message"),
deleteMedia = [];
let i;

input.addEventListener("change", () => { //Eventlistner voor inputvelden
const files = input.files; //haalt geselecteerde bestanden op
for (i = 0; i < files.length; i++) { //forloop bestanden
    if (files[i].type.startsWith("image") || files[i].type.startsWith("video")) { //Controleert bestand type
        queuedMediaArray.push(files[i]); //voegt bestand toe in de wachtrij
    }
}
queuedForm.reset(); // reset van input-veld
displayQueuedMedia(); //Laat de wachtrij zien
});

inputDiv.addEventListener("drop", (e) => { // Eventlistner voor input div
e.preventDefault();
// console.log(files.type)
const files = e.dataTransfer.files; //haalt bestanden op die gedropt zijn
for (i = 0; i < files.length; i++) {  // forloop bestanden
    console.log(files[i].type)
    if (files[i].type.startsWith("image") || files[i].type.startsWith("video")) //controleert type bestand
    {
    if (queuedMediaArray.every(media => media.name !== files[i].name)) { //controleert of bestand al in wachtrij is
        console.log("test")
            queuedMediaArray.push(files[i]); //voegt bestand toe aan wachtrij mocht dit niet zo zijn
        }
    }
}
displayQueuedMedia(); // laat de wachtrij zien
});

function displayQueuedMedia() { // functie om wachtrij te tonen
let media = ""; //variabel
queuedMediaArray.forEach((file, index) => { //foreach loop
    const fileType = file.type.startsWith("image") ? "image" : "video" ; // haalt type bestand op
    media += //voegt bestand toe aan variabele 'Media'
        `<div class="media">
            <${fileType} src="${URL.createObjectURL(file)}" controls></${fileType}>
            <span onclick="deleteQueuedMedia(${index})">&times;</span> 
        </div>`; console.log("Hello World", fileType, file)
});
queuedDiv.innerHTML = media; // voegt media toe aan queuedDiv
}

function deleteQueuedMedia(index) { // functie om bestand te verwijderen uit wachtrij
queuedMediaArray.splice(index, 1); 
displayQueuedMedia();
}

queuedForm.addEventListener("submit", (e) => { //eventlistener voor formulier
e.preventDefault() // voorkomt standaard gedrag
sendQueuedImagesToServer() // stuurt de wachtrij naar server
})

function sendQueuedImagesToServer(){ //Functie om wachtrij naar server te sturen
const formData = new FormData(queuedForm) // maakt formData aan
    
queuedImagesArray.forEach((image, index) => {
    formData.append(`file[${index}]`, image) //voegt bestand toe aan formData
})

fetch("upload", { //verstuurd formData naar server
    method: "POST",
    body: formData
})

.then(Response => { //
    if(response.status !== 200) throw Error(response.statusText) // controleert response status 200 is
    location.reload() // refresh pagina
})

.catch (error => {
    serverMessage.innerHTML = error // voeg error message toe
    serverMessage.style.cssText = "background-color: #f8d7da; color; #b71c1c" // veranderd achtergrond kleur
})
}