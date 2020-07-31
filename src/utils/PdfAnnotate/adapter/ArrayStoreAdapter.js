let annotationsArray = {};

function getAnnotations(documentId) {
  return annotationsArray[`${documentId}/annotations`] || [];
}

function updateAnnotations(documentId, annotations) {
  annotationsArray[`${documentId}/annotations`] = annotations;
}

function findAnnotation(documentId, annotationId) {
  let index = -1;
  let annotations = getAnnotations(documentId);
  for (let i = 0, l = annotations.length; i < l; i++) {
    if (annotations[i].uuid === annotationId) {
      index = i;
      break;
    }
  }
  return index;
}

// StoreAdapter for working with localStorage
// This is ideal for testing, examples, and prototyping
export default class ArrayStoreAdapter {
  setAnnotations(documentId, newAnnotations) {
    return new Promise((resolve, reject) => {
      let annotations = getAnnotations(documentId);
      newAnnotations.forEach((annotation) => {
        let findAnnotationIndex = findAnnotation(documentId, annotation.uuid);
        if (findAnnotationIndex === -1) {
          annotations.push(annotation);
        } else {
          annotations[findAnnotationIndex] = annotation;
        }
      });
      updateAnnotations(documentId, annotations);
      resolve(true);
    });
  }

  getAnnotations(documentId, pageNumber = - 1) {
    return new Promise((resolve, reject) => {
      let annotations = getAnnotations(documentId).filter((i) => {
        return (pageNumber === -1 || i.page === pageNumber) && i.class === 'Annotation';
      });

      resolve({
        documentId,
        pageNumber,
        annotations
      });
    });
  }

  resetAnnotation(documentId) {
    return new Promise((resolve, reject) => {
      updateAnnotations(documentId, []);
      resolve(true);
    });
  }
  getAnnotation(documentId, annotationId) {
    return Promise.resolve(getAnnotations(documentId)[findAnnotation(documentId, annotationId)]);
  }

  addAnnotation(documentId, annotation) {
    return new Promise((resolve, reject) => {
      let annotations = getAnnotations(documentId);
      annotations.push(annotation);
      updateAnnotations(documentId, annotations);
      resolve(annotation);
    });
  }

  editAnnotation(documentId, annotationId, annotation) {
    return new Promise((resolve, reject) => {
      let annotations = getAnnotations(documentId);
      annotations[findAnnotation(documentId, annotationId)] = annotation;
      updateAnnotations(documentId, annotations);
      resolve(annotation);
    });
  }

  deleteAnnotation(documentId, annotationId) {
    return new Promise((resolve, reject) => {
      let index = findAnnotation(documentId, annotationId);
      if (index > -1) {
        let annotations = getAnnotations(documentId);
        annotations.splice(index, 1);
        updateAnnotations(documentId, annotations);
        resolve(annotations);
      }

      resolve(true);
    });
  }
}