window.onload=function() {
	//get elements
	var f=1,img=document.getElementById('mainbutton'),
	cvrt=document.getElementById('mainbutton');
	//button click event
	cvrt.onclick=function(){
		if(f){
			img.className="changeColor";
			f=0;
			cvrt.innerHTML="Convert to Color";
		}
		else{
			img.className="";
			f=1;
			cvrt.innerHTML="Convert to B/W";
		}
	};
}