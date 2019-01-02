module.exports = (docs, docType) => {
    return new Promise(resolve => {
        let newRecord = {};
        let newRecords = [];
        let photos;
        let totalRecords = docs.length;
        if (docType === 'street') {
            console.log(`${totalRecords} ${docType} records for processing...`);
            docs.forEach(doc => {
                photos = [];
                doc.street_photos.forEach(photo => photos.push({
                    'url': photo.url,
                    'snapshot_position': photo.snapshot_position,
                    'location.coordinates': [],
                    'location.whatthreewords': ''
                }));

                newRecord = {
                    
                    'document_owner': doc.document_owner,
                    'street': doc.street,
                    'street_photos': photos,
                    'created': doc.created,
                    'properties': doc.properties,
                    'location': {
                        'type': doc.location && doc.location.type ? doc.location.type : '',
                        'coordinates': doc.location && doc.location.coordinates ? [doc.location.coordinates.longitude, doc.location.coordinates.latitude] : [],
                        'whatthreewords': doc.location && doc.location.whatthreewords ? doc.location.whatthreewords : ''
                    },
                    'enumerator': doc.enumerator,
                    'document_status': doc.document_status
                }

                newRecords.push(newRecord);

            });

            resolve(newRecords);
        }

        if (docType === 'property') {
            let index = 0;
            console.log(`${totalRecords} ${docType} records for processing...`);
            docs.forEach(doc => {

                photos = [];

                doc.property_photos.forEach(photo => photos.push({
                    'url': photo.url,
                    'snapshot_position': photo.snapshot_position,
                    'location.coordinates': [],
                    'location.whatthreewords': ''
                }));

                newRecord = {
                    
                    'document_owner': doc.document_owner,
                    'property': doc.property,
                    'property_photos': photos,
                    'created': doc.created,
                    'entities': doc.entities,
                    'location': {
                        'type': doc.location && doc.location.type ? doc.location.type : '',
                        'coordinates': doc.location && doc.location.coordinates ? [doc.location.coordinates.longitude, doc.location.coordinates.latitude] : [],
                        'whatthreewords': doc.location && doc.location.whatthreewords ? doc.location.whatthreewords : ''
                    },
                    'enumerator': doc.enumerator,
                    'contact': doc.contact,
                    'document_status': doc.document_status
                }
                index += 1;
                //console.log(`Processed document ${index} of ${docs.length}`);
                newRecords.push(newRecord);

            });

            resolve(newRecords);
        }

        if (docType === 'entity') {
            console.log(`${totalRecords} ${docType} records for processing...`);
            docs.forEach(doc => {

                photos = [];

                doc.property_photos.forEach(photo => photos.push({
                    'url': photo.url,
                    'snapshot_position': photo.snapshot_position,
                    'location.coordinates': [],
                    'location.whatthreewords': ''
                }));

                let entity = doc.entity;
                entity.category = entity.categories ? entity.categories.toString() : 'N/A';
                delete entity.categories;

                newRecord = {
                    
                    'document_owner': doc.document_owner,
                    'property_id': doc.property_id,
                    'entity': entity,
                    'property_photos': photos,
                    'created': doc.created,
                    'modified': doc.modified,
                    'modified_by': doc.modified_by,
                    'entities': doc.entities,
                    'location': {
                        'type': doc.location && doc.location.type ? doc.location.type : '',
                        'coordinates': [],
                        'whatthreewords': doc.location && doc.location.whatthreewords ? doc.location.whatthreewords : ''
                    },
                    'enumerator': doc.enumerator,
                    'contact': doc.contact,
                    'document_owner': doc.document_owner,
                    'document_status': doc.document_status
                }

                newRecords.push(newRecord);

            });

            resolve(newRecords);
        }
    });
}