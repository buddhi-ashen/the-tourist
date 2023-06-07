import React, {
    useRef,
    useEffect,
    useState,
    useCallback,
    useMemo,
} from "react";
import { Paper, Typography, useMediaQuery } from "@mui/material";
import Rating from "@mui/material/Rating";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";

import MapGL, { GeolocateControl, Marker } from "react-map-gl";
import Geocoder from "react-map-gl-geocoder";

import useStyles from "./styles";
import "mapbox-gl/dist/mapbox-gl.css";
import mapboxgl from 'mapbox-gl';
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
// eslint-disable-next-line import/no-webpack-loader-syntax
mapboxgl.workerClass = require('worker-loader!mapbox-gl/dist/mapbox-gl-csp-worker').default;

const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOXGL_ACCESS_TOKEN;

const Map = ({ places, setBounds, setClickedMarker, containerRef, mode }) => {
    const classes = useStyles();
    const desktopScreen = useMediaQuery("(min-width:600px)");

    const [viewport, setViewport] = useState({
        latitude: 16.806513845650294,
        longitude: 96.15593339811613,
        zoom: 12.303149558712713,
    });

    const mapRef = useRef();

    useEffect(() => {
        const bounds = mapRef.current.getMap().getBounds();
        setBounds({
            ne: bounds._ne,
            sw: bounds._sw,
        });
    }, [setBounds]);

    const handleViewportChange = useCallback((newViewport) => {
        setViewport(newViewport);
    }, []);

    const handleGeocoderViewportChange = useCallback((newViewport) => {
        const geocoderDefaultOverrides = { transitionDuration: 1000 };
        handleViewportChange({
            ...newViewport,
            ...geocoderDefaultOverrides,
        });
    }, [handleViewportChange]);

    const handleTransitionEnd = useCallback(() => {
        const bounds = mapRef.current.getMap().getBounds();
        setBounds({
            ne: bounds._ne,
            sw: bounds._sw,
        });
    }, [setBounds]);

    const markers = useMemo(() =>
        places?.map((place, i) => {
            if (!isNaN(place.longitude)) {
                return (
                    <Marker
                        longitude={Number(place.longitude)}
                        latitude={Number(place.latitude)}
                        key={i}
                        className={classes.markerContainer}
                        offsetLeft={-20}
                        offsetTop={-10}
                        onClick={() => {
                            setClickedMarker(i);
                        }}
                    >
                        {!desktopScreen ? (
                            <LocationOnOutlinedIcon
                                color="primary"
                                fontSize="large"
                            />
                        ) : (
                            <Paper elevation={3} className={classes.paper}>
                                <Typography
                                    className={classes.typography}
                                    variant="subtitle2"
                                    gutterBottom
                                >
                                    {" "}
                                    {place.name}
                                </Typography>
                                <img
                                    className={classes.pointer}
                                    alt={place.name}
                                    src={
                                        place.photo
                                            ? place.photo.images.large.url
                                            : "https://jooinn.com/images/blur-restaurant-1.png"
                                    }
                                />
                                <Rating
                                    name="read-only"
                                    size="small"
                                    value={Number(place.rating)}
                                    readOnly
                                />
                            </Paper>
                        )}
                    </Marker>
                );
            } else {
                return null;
            }
        }),
        [
            places,
            desktopScreen,
            classes.markerContainer,
            classes.paper,
            classes.pointer,
            classes.typography,
            setClickedMarker,
        ]
    );

    return (
        <div className={classes.mapContainer}>
            <MapGL
                ref={mapRef}
                {...viewport}
                width="100%"
                height="100%"
                onViewportChange={handleViewportChange}
                onTransitionEnd={handleTransitionEnd}
                mapboxApiAccessToken={MAPBOX_TOKEN}
                mapStyle={mode === 'light' ? "mapbox://styles/mapbox/streets-v11" : "mapbox://styles/mapbox/dark-v10"}
            >
                <Geocoder
                    mapRef={mapRef}
                    containerRef={containerRef}
                    onViewportChange={handleGeocoderViewportChange}
                    mapboxApiAccessToken={MAPBOX_TOKEN}
                    inputValue=""
                />
                <GeolocateControl
                    style={{ top: 10, right: 10 }}
                    positionOptions={{ enableHighAccuracy: true }}
                    trackUserLocation={true}
                    auto
                />
                {markers}
            </MapGL>
        </div>
    );
};

export default Map;
