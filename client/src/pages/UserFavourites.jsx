import { useSelector } from "react-redux";
import ProfileNav from "../components/ProfileNav";
import ProfileCard from "../components/ProfileCard";
import UserFavouritesComponent from "../components/UserFavourites";

const UserFavourites = () => {
  const { currentUser } = useSelector((state) => state.user);

  return (
    <main className="kh-profile">
      <div className="container">
        <div className="row">
          <div className="col-3">
            <ProfileNav active="Dashboard" subActive={false} />
          </div>
          <div className="col-9">
            <div className="kh-profile__tab">
              {currentUser ? (
                (() => {
                  const user = currentUser.user || currentUser;
                  return <ProfileCard />;
                })()
              ) : (
                <p>No user data available</p>
              )}
            </div>
            <UserFavouritesComponent />
          </div>
        </div>
      </div>
    </main>
  );
};

export default UserFavourites;
