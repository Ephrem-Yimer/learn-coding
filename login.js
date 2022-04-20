
    const eye= document.getElementById('eye');
    const input = document.querySelectorAll('input');
    const p = document.getElementById('password');

    const pattern = {
    Email: /^([\w]+)@(gmail\.com)$/,
    password:/^[w\d @\.#\$]{8,9}$/, 
	pssword:/^[\w\d@\.#\$\*]{9,12}$/
};

function validate(field,regex){

   if(regex.test(field.value)){
     field.className ='valid';
    //    field.classList.Add('valid');
   }
   else
  field.className = "invalid";
      //field.classList.Add('invalid');

}
input.forEach((inp)=>{
    inp.addEventListener('keyup',(e)=>{
       
         validate(e.target,pattern[e.target.attributes.name.value]);
       
    });
});

p.addEventListener('keyup',(e)=>{
			
	if(e.target.value.length <= 12 && e.target.value.length >= 10){
			
			document.abeni.action="/company";
            p.setAttribute('name','pssword');
			p.setAttribute('maxlength',12);
	}
			
});
eye.addEventListener('click',(e)=>{
			var state = false;
			if(state){
			p.setAttribute('type','password');
			e.target.style.color = "#7a797e";
			state = false;
			}
			else{
				p.setAttribute('type','text');
				e.target.style.color = "cyan";
				state = true;
			}
			
		});