import React from "react";

export default function NotFound() {
  return (
    <main className="">
      <section className="page_404">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-12">
              <div className="four_zero_four_bg">
                <h1 className="text-center ">404 Page Not Found</h1>
              </div>

              <div className="contant_box_404">
                <h3 className="h2">Look like you're lost</h3>

                <p>Hungry?</p>

                <a href="/" className="link_404">
                  Let Cook
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
