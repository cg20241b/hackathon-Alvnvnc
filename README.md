# Three.js Shader Hackathon Project

**Objective:**  
This project demonstrates custom vertex and fragment shaders using Three.js in a GitHub Codespace environment. The goal is to gain practical experience in shader-based materials, lighting, and object manipulation, culminating in an interactive 3D scene rendered in the browser.

**Instructions:**

1. **Project Setup:**
   - Clone this repository into a GitHub Codespace.
   - Install all required dependencies (e.g., `npm install`) and run the development server.
   - Ensure that the project runs correctly and can be previewed directly within the Codespace environment.

2. **Scene Composition:**
   - Determine the last alphabet character of your name. For example, if your name is "Ardi," the last alphabet is "i."
   - Determine the last digit of your student ID. For example, if your student ID is `123456`, the last digit is `6`.
   - Create 3D text meshes representing:
     - The alphabet character (placed on the **left** side of the view).
     - The digit (placed on the **right** side of the view).

3. **Color Specification:**
   - Assign the alphabet mesh your favorite color from Assignment 1.
   - Assign the digit mesh the complementary color of the alphabet’s color.

4. **Central Cube (Light Source):**
   - Add a small cube at the center of the scene, between the alphabet and the digit meshes.
   - The cube should appear to "glow" white, serving as a point light source.
   - Use a dedicated `ShaderMaterial` that simulates light emission.

5. **Shader Materials for Characters:**
   Two distinct `ShaderMaterial` instances must be created—one for the alphabet and one for the digit—featuring custom shading models influenced by the cube’s position as a point light source.

   - **Alphabet ShaderMaterial:**
     - **Ambient:** Use an intensity of `0.abc`, where `abc = (last three digits of your Student ID) + 200`. For example, if the last three digits are `456`, then `abc = 656` and ambient intensity = `0.656`.
     - **Diffuse:** Implement diffuse lighting influenced by the cube’s position.
     - **Specular (Plastic):** Add a plastic-like specular highlight, using a Blinn-Phong or Phong model with moderate shininess.

   - **Digit ShaderMaterial:**
     - **Ambient:** Apply the same ambient intensity calculation as above.
     - **Diffuse:** Diffuse lighting also comes from the cube’s point light source.
     - **Specular (Metal):** Add a metal-like specular highlight. Make the specular color more closely related to the base color and increase the reflectivity or shininess for a metallic appearance.

6. **Interactivity:**
   - **Cube Movement:**  
     - Press `W` to move the cube upward (increase Y coordinate).
     - Press `S` to move the cube downward (decrease Y coordinate).
   
   - **Camera Movement:**  
     - Press `A` to move the camera left.
     - Press `D` to move the camera right.
     The camera should translate linearly, not orbit around the objects.

7. **Version Control & Submission:**
   - Commit changes regularly to this repository.
   - Push the final version before the submission deadline.

**Deadline:**  
**Monday, 9 December 2021, 21:00**

---

**Additional Notes:**
- Ensure that all shader code is well-documented and commented.
- Test the interactivity (W, S, A, D keys) to confirm the correct behavior.
- Verify that the ambient, diffuse, and specular components are visually distinguishable and aligned with the specified materials (plastic vs. metal appearance).

After completing all requirements, your final project should showcase a properly lit scene with custom shader materials, a dynamic light source, and interactive controls for both the light and camera.
