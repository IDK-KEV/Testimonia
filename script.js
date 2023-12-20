function test(){
  if (!"speechSynthesis" in window) {
    alert("Sorry, your browser doesn't support text to speech!");
    return;
}else{

    console.log("hello world");
}

}


class Testimonial {
    constructor(Naam, Beschrijving, Student, ComakerID, Leerjaar,LeerRichting) {
      this.Naam = Naam;
      this.Beschrijving = Beschrijving;
      this.Student = Student;
      this.ComakerID=ComakerID;
      this.Leerjaar=Leerjaar;
      this.LeerRichting=LeerRichting;
    }

   
    
  }

  let Naam;
  let Beschrijving;
  let Student;
  let ComakerID;
  let Leerjaar;
  let leerRichting
  
  module.exports = Testimonial;

