import "./App.css";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeadphones } from '@fortawesome/free-solid-svg-icons';
import { faPlay } from '@fortawesome/free-solid-svg-icons';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const CLIENT_ID = "d40363f3bbee4dbcb6bcf7eedc47b2d0";
const CLIENT_SECRET = "d24f9bf8b3e74fd2a97637a1243eac62";

function NavigationBar({children}) {
  return (
    <div className="topnav-container">
      {children}
    </div>
  )
}

function Logo() {
  return (
    <div className="logo">
      <h1><FontAwesomeIcon icon={faHeadphones} /> BeatCloud</h1>
    </div>
  )
}

function NumResult({music}) {
  return (
    <p>
      Found <strong>{music.length}</strong> results
    </p>
  )
}

function Search({setMusic, music}) {
  const [query, setQuery] = useState("");
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
  const authParameter = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body:
      "grant_type=client_credentials&client_id=" +
      CLIENT_ID +
      "&client_secret=" +
      CLIENT_SECRET,
  };
  fetch("https://accounts.spotify.com/api/token", authParameter)
  .then((result) =>  result.json().then((data) => 
    setAccessToken(data.access_token)));
},[]);


  async function search() {
    console.log("Searching for " + query);
    var trackParameters = {
    method: "GET",
    headers: {
      "Content-Type" : "application/json",
      Authorization: "Bearer " + accessToken, 
    },
   };

   var tracks = await fetch (
    "https://api.spotify.com/v1/search?q=" + query + "&type=track&limit=50",
   trackParameters)
   .then((result) => result.json().then((data) => 
    setMusic(data.tracks.items)));
  }
  return (
    <input
      className="search"
      type="text"
      placeholder="Search music"
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          search();
        }
      }}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
}

function MusicBox({children, title, subtitle}) {
  return (
    <div className="music-box">
      <h2 className="title">{title}</h2>
      <h3 className="subtitle">{subtitle}</h3>
      {children}
    </div>
  )
}

function PlaylistBox ({children, title, subtitle}) {
  return (
    <div className="playlist-box">
      <h2 className="title"><FontAwesomeIcon icon={faPlay} /> {title}</h2>
      <h3 className="subtitle">{subtitle}</h3>
      {children}
    </div>
  )
}

function Music({ music, playlist, addToPlaylist, removeFromPlaylist }) {
  const togglePlaylist = (music) => {
    if (playlist.some((m) => m.id === music.id)) {
      removeFromPlaylist(music);
    } else {
      addToPlaylist(music);
    }
  };

  const PopularityRating = ({popularity}) => {
    if (popularity >= 0 && popularity <= 20) {
      return <span style={{fontSize: 22}}>⭐️</span>
    } else if (popularity >= 21 && popularity <= 40) {
      return <span style={{fontSize: 22}}>⭐️⭐️</span>
    } else if (popularity >= 41 && popularity <= 60) {
      return <span style={{fontSize: 22}}>⭐️⭐️⭐️</span>
    } else if (popularity >= 61 && popularity <= 80) {
      return <span style={{fontSize: 22}}>⭐️⭐️⭐️⭐️</span>
    } else if (popularity >= 81 && popularity <= 100) {
      return <span style={{fontSize: 22}}>⭐️⭐️⭐️⭐️⭐️</span> 
    } else {
      return <span>No Rating</span>
    }
  };

  return (
    <>
      <ul>
        {music.map((music) => (
          <li key={music.id}>
            <div className="music-container">
              <img src = {music.album.images[0].url} alt = "Album" width={300}/>
              <div className="music-info">
                <h1>{music.name}</h1>
                <h4> {music.album.name}</h4>
                <h2>{music.artists[0].name}</h2>
                <button
                  className={playlist.some((m) => m.id === music.id) ? "liked" : ""}
                  onClick={() => togglePlaylist(music)}
                >
                  {playlist.some((m) => m.id === music.id) ? (
                    <FontAwesomeIcon className="button-active" icon={faHeart} />
                  ) : (
                    <FontAwesomeIcon icon={faHeart} />
                  )}
                </button>
                &nbsp; <PopularityRating popularity={music.popularity}/>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}


function Playlist({playlist}) {
  return (
    <>
      <ul className="playlist-list">
        <p>Total of <strong>{playlist.length}</strong> Songs </p>
        {playlist.map((music) => (
          <li key={music.id}>
            <div className="playlist-container">
              <img src = {music.album.images[0].url} alt = "Album" width={300}/>
              <div className="playlist-info">
                <h1>{music.name}</h1> <i class="fa-solid fa-heart"></i>
                <h4>{music.album.name}</h4>
                <h2>{music.artists[0].name}</h2>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function Main({children}) {
  return (
    <div>
      <div className="container-main">{children}</div>
    </div>
  )
}

function SortDropdown({handleSortChange}) {
  return (
    <div className="container-sort">
      <label>Sort By: </label>
      <select id="sort" onChange={handleSortChange}>
        <option value="nameaz">Title (A-Z)</option>
        <option value="nameza">Title (Z-A)</option>
        <option value="artist">Artist</option>
        <option value="popularityup">Popularity ↑</option>
        <option value="popularitydown">Popularity ↓</option>
      </select>
    </div>
  );
}

function App() {
  const [music, setMusic] = useState([]);
  const [playlist, setPlaylist] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMusic, setFilteredMusic] = useState([]);
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const sortedMusic = [...filteredMusic].sort((a, b) => {
      switch (sortOption) {
        case "nameaz":
          return (a.name?? "").localeCompare(b.name?? "");
        case "nameza":
          return (b.name?? "").localeCompare(a.name?? "");
        case "artist":
          return (a.artists[0].name?? "").localeCompare(b.artists[0].name?? "");
        case "popularityup":
          return a.popularity - b.popularity; 
        case "popularitydown":
            return b.popularity - a.popularity;
        default:
          return 0;
      }
    });

    if (!arraysAreEqual(sortedMusic, filteredMusic)) {
      setFilteredMusic(sortedMusic);
    }
  }, [sortOption, filteredMusic]);

  function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i]!== arr2[i]) {
        return false;
      }
    }
    return true;
  }

  useEffect(() => {
    if (searchQuery === "") {
      setFilteredMusic(music);
    } else {
      const filtered = music.filter(
        (music) => {
          if (music.name && music.artist) {
            return music.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                   music.artists[0].name.toLowerCase().includes(searchQuery.toLowerCase())
          }
          return false;
        });
      setFilteredMusic(filtered);
    }
  }, [searchQuery, music]);

  const addToPlaylist = (music) => {
    if (!playlist.some((m) => m.id === music.id)) {
      setPlaylist([...playlist, music]);
    }
  };

  const removeFromPlaylist = (music) => {
    setPlaylist(playlist.filter((m) => m.id!== music.id));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  return (
    <div>
      <NavigationBar>
        <Logo/>
        <Search setMusic={setMusic}/>
        <NumResult music={filteredMusic}/>
      </NavigationBar>
    
    <div className="main-container">
      <div className="playlist-bar">
        <PlaylistBox title = {"Your Playlist"} subtitle = {"All the music you love"} playlist = {"Playlist"}>
          <Playlist playlist={playlist}/>
        </PlaylistBox>
      </div>
      <Main>
        <MusicBox title = {"Music List"} subtitle = {"Find Your Groove in the Cloud"}>
          <SortDropdown handleSortChange={handleSortChange} />
          <Music 
            music={filteredMusic}
            playlist={playlist}
            addToPlaylist={addToPlaylist}
            removeFromPlaylist={removeFromPlaylist}
          />
        </MusicBox>
      </Main>
    </div>
    </div>
  );
}

export default App;
//stateful components
//stateless components
//structural components
