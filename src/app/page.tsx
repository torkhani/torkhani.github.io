import Image from "next/image";

export default function Home() {
  return (
    <nav className="navbar navbar-expand-lg fancy navbar-light md:!bg-[#ffffff] sm:!bg-[#ffffff] xsm:!bg-[#ffffff] navbar-clone fixed navbar-unstick">
        <div className="container">
          <div className="navbar-collapse-wrapper bg-[rgba(255,255,255)] opacity-100 flex flex-row !flex-nowrap w-full justify-between items-center">
              <div className="navbar-brand w-full">
              </div>
              <div className="navbar-collapse offcanvas offcanvas-nav offcanvas-start">
                <div className="offcanvas-header xl:hidden lg:hidden flex items-center justify-between flex-row p-6">
                  <h3 className="text-white xl:text-[1.5rem] !text-[calc(1.275rem_+_0.3vw)] !mb-0">Moetaz TORKHANI</h3>
                  <button type="button" className="btn-close btn-close-white mr-[-0.75rem] m-0 p-0 leading-none text-[#343f52] transition-all duration-[0.2s] ease-in-out border-0 motion-reduce:transition-none before:text-[1.05rem] before:content-['\ed3b'] before:w-[1.8rem] before:h-[1.8rem] before:leading-[1.8rem] before:shadow-none before:transition-[background] before:duration-[0.2s] before:ease-in-out before:flex before:justify-center before:items-center before:m-0 before:p-0 before:rounded-[100%] hover:no-underline bg-inherit before:bg-[rgba(255,255,255,.08)] before:font-Unicons hover:before:bg-[rgba(0,0,0,.11)] focus:outline-0" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                </div>
                <div className="offcanvas-body xl:!ml-auto lg:!ml-auto flex  flex-col !h-full">
                  <ul className="navbar-nav">
                    <li className="nav-item dropdown dropdown-mega">
                      <a className="nav-link dropdown-toggle  font-bold tracking-[-0.01rem] hover:!text-[#d16b86] after:!text-[#d16b86]" href="#" data-bs-toggle="dropdown">Projects</a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
        </div>
    </nav>
  );
}
