import { GoogleOAuthProvider } from "@react-oauth/google";
import React from "react";
import { Navigate, Route, BrowserRouter as Router, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { IsPlayingProvider } from "./context/IsPlayingProvider";
import { PlaylistProvider } from "./context/PlaylistProvider";
import SearchContext from "./context/SearchContext";
import { SongProvider } from "./context/SongProvider";
import { UserDataProvider } from "./context/UserDataProvider";
import { UserProvider } from "./context/UserProvider";
import Main from "./Layout/Main/Main";
import Overview from "./pages/Account/OverviewDashboard";
import Profile from "./pages/Account/Profile/Profile";
import Chat from "./pages/Chat/DeepSeekChat";
import ResetPassword from "./pages/ForgotPassword/ForgotPassword";
import Home from "./pages/Home/Home";
import SpotifyLogin from "./pages/Login/Login";
import PaymentMethod from "./pages/PaymentMethod/PaymentMethod";
import PlaylistDetail from "./pages/PlaylistDetail/PlaylistDetail";
import Premium from "./pages/Premium/premium";
import Signup from "./pages/Signup/Signup";
import Upload from "./pages/UploadPage/UploadPage";
import VNPayPayment from "./pages/VNPayPayment/VNPayPayment";

/*Artist*/
import ArtistLayout from "./Layout/ArtistLayout/ArtistLayout";
import ArtistAlbumList from "./pages/Artist/ArtistAlbumList/ArtistAlbumList";
import ArtistSongList from "./pages/Artist/ArtistSongList/ArtistSongList";
import CreateAlbum from "./pages/Artist/CreateAlbum/CreateAlbum";

/*Admin*/
import AdminLayout from "./Layout/AdminLayout/AdminLayout";


import "react-toastify/dist/ReactToastify.css"; // Đừng quên import CSS của toastify

const App = () => {
  return (
    <UserDataProvider>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <UserProvider>
          <IsPlayingProvider>
            <SongProvider>
              <PlaylistProvider>
                <UserProvider>
                  <Router>
                    <div
                      className="App"
                      style={{ backgroundColor: "#000000", minHeight: "100vh" }}
                    >
                      <Routes>
                        {/* Các route không cần sidebar,header,footer */}
                        <Route path="/login" element={<SpotifyLogin />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route
                          path="/password-reset"
                          element={<ResetPassword />}
                        />
                        <Route
                          path="/account/overview"
                          element={<Overview />}
                        />
                        <Route path="/account/profile" element={<Profile />} />
                        <Route
                          path="/payment-method"
                          element={<PaymentMethod />}
                        />
                        <Route
                          path="/payment/vnpay"
                          element={<VNPayPayment />}
                        />
                        <Route path="/" element={<Navigate to="/user" replace />} />
                      </Routes>
                      <Routes>
                        <Route
                          path="/admin/*"
                          element={
                            <AdminLayout>
                              <Routes>
                                <Route path="/account" element={<Upload />} />
                              </Routes>
                            </AdminLayout>
                          }
                        />
                      </Routes>

                      {/* ARTIST */}
                      <Routes>
                        <Route
                          path="/artist/*"
                          element={
                            <ArtistLayout>
                              <Routes>
                                <Route path="/upload" element={<Upload />} />
                                <Route
                                  path="/songs"
                                  element={<ArtistSongList />}
                                />
                                <Route
                                  path="/albums"
                                  element={<ArtistAlbumList />}
                                />
                                <Route
                                  path="/albums/new"
                                  element={<CreateAlbum />}
                                />
                              </Routes>
                            </ArtistLayout>
                          }
                        />
                      </Routes>

                      {/* USER */}
                      <Routes>
                        {/* Các route cần sidebar,header,footer được bao trong MainLayout */}
                        <Route
                          path="/user/*"
                          element={
                            <SearchContext>
                              <Main>
                                <Routes>
                                  <Route path="/" element={<Home />} />
                                  <Route
                                    path="/playlist/:idPlaylist"
                                    element={<PlaylistDetail />}
                                  />
                                  <Route path="/chat" element={<Chat />} />
                                  <Route path="/premium" element={<Premium />} />
                                </Routes>
                              </Main>
                            </SearchContext>
                          }
                        />
                      </Routes>
                      <ToastContainer
                        position="top-right"
                        autoClose={3000}
                        hideProgressBar={false}
                        newestOnTop={true}
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                      />
                    </div>
                  </Router>
                </UserProvider>
              </PlaylistProvider>
            </SongProvider>
          </IsPlayingProvider>
        </UserProvider>
      </GoogleOAuthProvider>
    </UserDataProvider>
  );
};

export default App;
