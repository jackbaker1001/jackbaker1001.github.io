---
title: Research
permalink: /research/
---
Broadly speaking, if quantum theory can be advantageously used or applied to a domain, I will pursue it. This can be considered the unifying theme of my research interests, bringing together the trifecta of large-scale first principles simulations of solids, quantum machine learning and quantum optimization under the same banner. The first of these topics was covered in my Ph.D. research. I used massively parallel density functional functional theory codes on large supercomputers to simulate ferroelectric and antiferroelectric systems at unprecedented scale. These simulations provided accurate charecterizations of topological polar textures and revealed new phase transition behaviour in antiferroelectrics. I am still involved in this area, but now spend most of my time ideating and implementing new algorithms for noisy intermediate scale quantum computers. In particular, I am interested in using quantum machine learning and optimization in materials science and finance applications. Lastly, from the perspective of pure computational science, I am working towards the realization of the much anticipated joining of classical high performance computing and quantum hardware.

<b>Use the below links to jump to research highlights:</b>

<p>


<div style="background-color: #f2f2f2; border-radius: 10px; padding: 10px;">
  <p>
    <a href="#quantum">Quantum Algorithms </a> |
    <a href="#textures">Polar morphologies from first principles</a> |
    <a href="#phasetransitions">Phase transitions in antiferroelectrics</a> |
  </p>
</div><br>
<hr>

<h2 id="quantum">Quantum Algorithms</h2><br>

<div style="max-width: 100%; height: auto; overflow: hidden; border-radius: 20px;">
  <img src="https://raw.githubusercontent.com/jackbaker1001/jackbaker1001.github.io/master/assets/img/jack_at_aps.png" alt="Banner Image" style="width: 100%; height: 100%; object-fit: cover;">
</div>
<div style="text-align: center;">
  <figcaption style="display: block;"><i>APS March Meeting 2023, Las Vegas, Nevada.</i></figcaption>
</div>
<br>
Now that noisy intermediate scale quantum (NISQ) computers have been built, I am working towards making them more than mere physics experiments. While <i>quantum supremacy</i> has now been demonstrated using NISQ hardware for various sampling experiments, the practical use of this supremacy is limited. Therefore, the challenge is to use the limited number of noisy qubits we have at hand to do something really useful.<br><br> 

One promizing area is quantum machine learning (QML). I have developed various QML algorithms suited for NISQ hardware for time-series analysis, outlier detection, and others utilizing novel hybrid-quantum classical neural network architectures and multiple kernel learning. As I have already stressed, practical quantum advantage is the end goal, but there are many obstacles along the way. There are, for example, many unsolved problems in fundamental QML research for which I am also interested in finding solutions to. <br><br>

Another areas which intrigues me is the potential for NISQ hardware to approximately solve NP-hard combinatorial optimization problems. Such problems appear everywhere from finance to route optimization so these algorithms are researched heavily. There are very well-known algorithms for this task (notably the quantum approximate optimization algorithm and quantum annealing) but they face problems at scale. I am therefore interested in (i) enhancing existing approaches using classical deep learning techniques and others (ii) working towards new optimization algorithms in general. My recent research in this area revolves around benchmarking quantum optimization on NISQ hardware for finance applications like portfolio optimization and diversification.<br><br> 

A final important topic I will mention is levaraging algorithm-agnostic tricks for either speeding up or increasing the quality of results from quantum algorithms. For the former, I investigate new ways of computing parallel quantum circuits on (relatively) large quantum computers using quantum multi-programming. For the latter, I study how error mitigation techniques like dynamical decoupling and pauli twirling can help to increase application specific performance in QML and optimization. Furthermore, all of these techniques can be applied in tandem using new hybrid computing systems (like Qiskit Runtime etc.) helping to bring about the intersection of quantum and classical high performance computing.   

<hr>

<h2 id="textures">Polar morphologies from first principles</h2>

Broadly, a polar morphology is a distinct pattern of electrical dipole moments arranged in a solid or nanostructure. These (admittedly visually mesmerizing) objects can give rise to novel materials properties including (but not limited to) negative capacitance and giant electromechanical responses. Some of these properties are the direct result of of their unique topologies. Indeed, tolological phases like polar skyrmions, polar waves and chiral bubble domains have all been found in the now widely studied PbTiO<sub>3</sub>/SrTiO<sub>3</sub> heterostructure. <br><br>

Where do I fit in to all of this? Well, from an atomistic perspective, simulations able to capture these polar morphologies need thousands if not millions of atoms. This puts standard implementations of first principles density functional theory (DFT) well out of reach and leaves most practitioners dealing with second principles methods and phase-field modelling. However, using large-scale first principles DFT methods, we <i>can</i> simulate these systems provided we have huge computational resources (thousands to tens of thousands of physical cores) to lean on. This is what I am involved with; massively parallel simulations of polar textures using large supercomputers.<br><br>

Using these large-scale techniques, I have unveiled the mechanism causing the formation polar-wave textures in thin ferroelectric films and determined critical thicknesses for the formation of polar flux-closure domains. I have also contributed towards answering some long standing questions regarding the orientation of ferroelectric domains in thin films in the presence of surface trenches. Using large-scale DFT, we discovered that the alignment is due to a favorable arrangement of electrical dipole moments which minimize trench-induced depolarizing fields. This mechanism has broad applicability and can be used to engineer other polar textures in various ferroelectric nanostructures. In the future, I am looking towards conducting the first quantum-mechanical simulations of polar skyrmions using linear scaling DFT. First, we will need a <i>very large</i> supercomputer.


<hr>

<h2 id="phasetransition">Phase transitions in antiferroelectrics</h2>
