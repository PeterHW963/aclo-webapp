# aclo-webapp

An E-commerce website for Aclo Kids

Stack: MERN (ReactTS, TailwindCSS)

Media Files here: https://drive.google.com/drive/folders/1SKppfBxIqeFtCQiOBIFwNS9com7imV_C <br>
Current static website here: https://aclokids.com/ <br>
Youtube tutorial video: https://www.youtube.com/watch?v=hpgh2BTtac8

Project Structure:
FRONTEND:
components - contain all usable components that can be used across multiple pages

- admin - admin section comps like admin dashboard, order management, user management
- cart - shopping cart, checkout, payment button
- common - header, footer, navbar
- layout - user layout, hero layout, cart drawer
- products - product details, product price <br>

Pages - all pages components (either full page or a route):

- home
- admin home
- login
- collection

Packages needed for BACKEND:

- express - nodeJs framework to build APIs,
- mongoose - object data modelling lib for mongoDB to define schemas for our data & querying from database,
- dotenv - load env variables from .env file,
- jsonwebtoken - authentication & authorizxation of users,
- bcryptjs - for hashing passwords stored in the website,
- cors - to connect FE and BE because FE and BE are hosted on diff domains,
- nodemon - dev tool that restarts server whenever we save changes instead of manually restarting everytime

To run FE, cd into the frontend folder and run `npm run dev`
To run BE, cd into the backend folder and run `npm run dev`
BACKEND STRUCTURE:

- models - store all our schemas
