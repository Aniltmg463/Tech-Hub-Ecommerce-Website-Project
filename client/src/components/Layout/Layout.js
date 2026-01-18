import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";

const Layout = ({ children, title, description, keywords, author }) => {
  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <meta charSet="utf-8" />
          <meta name="description" content={description} />
          <meta name="keywords" content={keywords} />
          <meta name="author" content={author} />
          <title>{title}</title>
        </Helmet>
        <Header />
        <main style={{ minHeight: "70vh" }}>
          <Toaster />
          {children}
        </main>
        <Footer />
      </div>
    </HelmetProvider>
  );
};

//=> this is for default parameter
// Layout.defaultProps = {
//   title: "Tech Hub Website",
//   description: "Full stack project",
//   keywords: "react, seo, helmet, mern",
//   author: "Tech Anil",
// };

export default Layout;

// const Layout = ( porps) => {
//   return (
//     <div>
//         <Header/>
//         <main style={{ minHeight: "80vh"}} > {porps.children}</main>
//         <Footer/>

//     </div>
//   )
// }
