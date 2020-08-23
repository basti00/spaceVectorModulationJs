# SpaceVectorModulationJs
An interactive animation to show the Space Vector Modulation (SVM). SVM is an
switching algorithm used to generate the three-phase current required to 
smoothly drive a three-phase electric motor.

Currently two things are visualized: 
* The vector space diagram with its six distinct realisable vectors. The 
arbitrary rotating vector and its two component-vectors are plotted on the diagram. 
* The PWM signal which results in these two specific component vectors. A 
dual-sided PWM and the alternating reversing switching method is used.

Using the sliders at the bottom you can adjust the magnitude and the roational
speed of the generated vector. Former is similar to a 
dutycycle and is proportional to the strenght of the magnetic field and latter is controlling
the speed of the rotating magnetic field.

[Live demo.](https://darkdeep.space/svm.html)

For more informations on SVM 
see these [slides](http://www.kappaiq.com/download/presentation-material/PDF/05%20Modulation.pdf).
