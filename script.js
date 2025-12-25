const latin = document.getElementById('latin');

const greek = document.getElementById('greek');

let activeInput = latin;



const toGreek = {
    "a":"Α","A":"Α",
    "e":"Ε","E":"Ε",
    "i":"Ͱ","İ":"Ͱ",
    "n":"Ν","N":"Ν",
    "r":"Ρ","R":"Ρ",
    "l":"L","L":"L",
    "ı":"Ь","I":"Ь",
    "k":"Κ","K":"Κ",
    "d":"D","D":"D",
    "m":"Μ","M":"Μ",
    "t":"Τ","T":"Τ",
    "y":"R","Y":"R",
    "s":"S","S":"S",
    "u":"U","U":"U",
    "o":"Q","O":"Q",
    "b":"Β","B":"Β",
    "ş":"Ш","Ş":"Ш",
    "ü":"Υ","Ü":"Υ",
    "z":"Ζ","Z":"Ζ",
    "g":"G","G":"G",
    "ç":"C","Ç":"C",
    "ğ":"Γ","Ğ":"Γ",
    "v":"V","V":"V",
    "c":"J","C":"J",
    "h":"Η","H":"Η",
    "p":"Π","P":"Π",
    "ö":"Ω","Ö":"Ω",
    "f":"F","F":"F",
    "x":"Ψ","X":"Ψ",
    "j":"Σ","J":"Σ",
    "0":"θ"
};



const toLatin = Object.fromEntries(Object.entries(toGreek).map(([k,v])=>[v,k.toUpperCase()]));



function translate(text, dir){

  const map = dir==="toGreek" ? toGreek : toLatin;

  return text.split('').map(ch=> map[ch] || ch ).join('');

}



latin.addEventListener('input', ()=>{ greek.value = translate(latin.value, "toGreek"); });

greek.addEventListener('input', ()=>{ latin.value = translate(greek.value, "toLatin"); });



latin.addEventListener('focus', ()=>activeInput = latin);

greek.addEventListener('focus', ()=>activeInput = greek);



document.querySelectorAll('.key').forEach(key => {

  key.addEventListener('click', () => {

    const action = key.dataset.action;

    if(action === 'delete') {

      activeInput.value = activeInput.value.slice(0,-1);

    } else if(action === 'enter') {

      activeInput.value += '\n';

    } else if(action === 'space') {

      activeInput.value += ' ';

    } else {

      activeInput.value += key.innerText;

    }



    if(activeInput === latin){

      greek.value = translate(latin.value, "toGreek");

    } else {

      latin.value = translate(greek.value, "toLatin");

    }

  });

});

