const inputs = document.querySelectorAll('input');
const p = document.getElementById('11');
const put = document.getElementById('password');

const pattern = {
    name: /^(jobseeker|Company)$/,
    Email: /^([\w]+)@(gmail\.com)$/,
    telephone: /^09\d{8}$/,
    password:/^[w\d @\.#\$]{8,9}$/,
  	pssword:/^[\w\d@\.#\$\*]{10,12}$/
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
inputs.forEach((inp)=>{
    inp.addEventListener('keyup',(e)=>{
       
         validate(e.target,pattern[e.target.attributes.name.value]);
       
    });
});
// password identifier
p.addEventListener('keyup',(e) => {

	if(e.target.value === 'jobseeker'){
		put.setAttribute('placeholder','enter Password 8-9 digits'); 
	   put.setAttribute('maxlength',9);
	else if(e.target.value === 'Company'){
		put.setAttribute('name','pssword');
		put.setAttribute('placeholder','enter Password 10-12 digits'); 
		put.setAttribute('maxlength',12);
	}
});


