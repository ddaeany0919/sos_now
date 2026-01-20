declare namespace naver {
    namespace maps {
        class Map {
            constructor(element: string | HTMLElement, options: any);
            setCenter(latlng: LatLng): void;
            setZoom(zoom: number): void;
        }
        class LatLng {
            constructor(lat: number, lng: number);
        }
        class Marker {
            constructor(options: any);
            setMap(map: Map | null): void;
        }
        class Point {
            constructor(x: number, y: number);
        }
        namespace Event {
            function addListener(instance: any, eventName: string, handler: Function): void;
        }
    }
}
