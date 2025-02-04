import { useParams } from "react-router";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { useEffect, useState } from "react"
import { Place } from "./Places";
import { StorageImage } from "@aws-amplify/ui-react-storage";

function PlaceDetails() {

    const client = generateClient<Schema>();

    const { id } = useParams();
    const [place, setPlace] = useState<Place | undefined>(undefined)

    useEffect(() => {
        const handleData = async () => {
            const result = await client.models.Place.get({ id: id! })
            if (result.data) {
                setPlace(result.data)
            }
        }
        handleData();

    }, [])

    function renderPhotos() {
        const rows: any[] = []
        if (place) {
            place.photos?.forEach((photo, index) => {
                if (photo) {
                    /**
                     * Files can be also handled with the aws-amplify/storage package:
                     * https://docs.amplify.aws/angular/build-a-backend/storage/download-files/
                     */
                    rows.push(<StorageImage path={photo} alt={photo} key={index} height={300} />)
                }
            })
        }
        return rows;
    }

    function renderPlace() {
        if (place) {
            return <div>
                <h2>Details for place {place?.name}</h2><br />
                <p>{place?.name}</p>
                <p>{place?.description}</p>
                {renderPhotos()}<br/>
            </div>
        } else {
            return <h2>Place not found</h2>
        }
    }

    return <main>
        {renderPlace()}
    </main>
}

export default PlaceDetails

