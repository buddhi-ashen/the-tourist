import React, { useEffect, useState, createRef } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { ThemeProvider, createTheme } from '@mui/material/styles';

import getPlacesData from "./api/index";

import Header from "./components/Header/Header";
import List from "./components/List/List";
import Map from "./components/Map/Map";
import axios from 'axios';

const App = () => {
  const [places, setPlaces] = useState([]);
  const [filteredPlaces, setFilteredPlaces] = useState([]);
  const [bounds, setBounds] = useState({});
  const [clickedMarker, setClickedMarker] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [type, setType] = useState("restaurants");
  const [rating, setRating] = useState("");
  const geocoderContainerRef = createRef();
  const [mode, setMode] = useState('light');

  const theme = createTheme({
    palette: {
      mode: mode
    }
  });

  useEffect(() => {
    setIsLoading(true);

    let CancelToken = axios.CancelToken;
    let source = CancelToken.source();

    getPlacesData(type, bounds.ne, bounds.sw, source).then((data) => {
      if (data !== undefined) {
        setPlaces(data);
        setFilteredPlaces([]);
        setRating("");
        setIsLoading(false);
      }
    });

    return () => source.cancel('Cancelled due to new request coming in');
  }, [type, bounds]);

  useEffect(() => {
    setFilteredPlaces(places.filter(place => place.rating > rating));
  }, [rating, places]); // Added 'places' as a dependency

  return (
    <ThemeProvider theme={theme}>
      <div>
        <CssBaseline/>
        <Header containerRef={geocoderContainerRef} mode={mode} setMode={setMode}/>

        <Grid container>
          <Grid items xs={12} md={4}>
            <List
              places={filteredPlaces.length ? filteredPlaces : places}
              clickedMarker={clickedMarker}
              isLoading={isLoading}
              type={type}
              setType={setType}
              rating={rating}
              setRating={setRating}
            />
          </Grid>
          <Grid items xs={12} md={8}>
            <Map
              setBounds={setBounds}
              places={filteredPlaces.length ? filteredPlaces : places}
              setClickedMarker={setClickedMarker}
              containerRef={geocoderContainerRef}
              mode={mode}
            />
          </Grid>
        </Grid>
      </div>
    </ThemeProvider>
  );
};

export default App;
