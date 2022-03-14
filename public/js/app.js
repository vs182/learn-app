function login() {
    window.location.href = "../views/index.html"
}

function register() {
    window.location.href = "../views/index.html"

}
let url = document.getElementById("link")

function vd() {

    let cc = document.getElementById("cc")
    cc.innerHTML = "";
    var iframe = document.createElement('iframe')
    iframe.setAttribute("src", vdurl.value)
    iframe.setAttribute("frameborder", "0")
    cc.append(iframe)
}
// function video(){
// var card = document.createElement("div")
// card.setAttribute("id","card")
// card.classList.add("card")
// var iframe = document.createElement('iframe')
// iframe.setAttribute("src",url.innerHTML)
// iframe.setAttribute("frameborder","0")
// iframe.setAttribute("allowfullscreen","true")
// var p = document.createElement("p")
// var btn = document.createElement("button")
// btn.innerHTML = "Watch";
// btn.setAttribute("onclick","on()");

// p.appendChild(btn)

// card.appendChild(iframe)
// card.appendChild(p)
// video_container.appendChild(card)
// }

// video()



function covert() {
    var con = document.getElementById("con").value
    var urls = con.split(`"`)

    output.value = urls[5]
}

function Copy() {
    /* Get the text field */
    var copyText = document.getElementById("output");

    /* Select the text field */
    copyText.select();
    copyText.setSelectionRange(0, 99999); /* For mobile devices */

    /* Copy the text inside the text field */
    navigator.clipboard.writeText(copyText.value);

    /* Alert the copied text */
    alert("Copied the text: " + copyText.value);
}