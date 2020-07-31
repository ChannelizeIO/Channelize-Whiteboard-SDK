import uuid from '../utils/uuid';
import StoreAdapter from './StoreAdapter';
import { fireEvent, addEventListener, removeEventListener } from '../UI/event';

// StoreAdapter for working with localStorage
// This is ideal for testing, examples, and prototyping
export default class LocalStoreAdapter extends StoreAdapter {
  constructor() {
    super({
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
      },

      getAnnotation(documentId, annotationId) {
        return Promise.resolve(getAnnotations(documentId)[findAnnotation(documentId, annotationId)]);
      },

      addAnnotation(documentId, pageNumber, annotation) {
        return new Promise((resolve, reject) => {
          annotation.class = 'Annotation';
          if (!annotation.uuid) {
            annotation.uuid = uuid();
          }
          annotation.page = pageNumber;

          let annotations = getAnnotations(documentId);
          annotations.push(annotation);
          updateAnnotations(documentId, annotations);
          fireEvent('annotation:added', documentId, annotation);
          resolve(annotation);
        });
      },

      editAnnotation(documentId, annotationId, annotation) {
        return new Promise((resolve, reject) => {
          let annotations = getAnnotations(documentId);
          var annotationIndex = findAnnotation(documentId, annotationId);
          if (annotationIndex > -1) {
            annotations[annotationIndex] = annotation;
            updateAnnotations(documentId, annotations);
          }
          fireEvent('annotation:updated', documentId, annotationId, annotation);
          resolve(annotation);
        });
      },

      deleteAnnotation(documentId, annotationId) {
        return new Promise((resolve, reject) => {
          let index = findAnnotation(documentId, annotationId);
          if (index > -1) {
            let annotations = getAnnotations(documentId);
            annotations.splice(index, 1);
            updateAnnotations(documentId, annotations);
          }
          fireEvent('annotation:removed', documentId, annotationId);
          resolve(true);
        });
      },

      getComments(documentId, annotationId) {
        return new Promise((resolve, reject) => {
          resolve(getAnnotations(documentId).filter((i) => {
            return i.class === 'Comment' && i.annotation === annotationId;
          }));
        });
      },

      addComment(documentId, annotationId, content) {
        return new Promise((resolve, reject) => {
          let comment = {
            class: 'Comment',
            uuid: uuid(),
            annotation: annotationId,
            content: content
          };

          let annotations = getAnnotations(documentId);
          annotations.push(comment);
          updateAnnotations(documentId, annotations);

          resolve(comment);
        });
      },

      deleteComment(documentId, commentId) {
        return new Promise((resolve, reject) => {
          getAnnotations(documentId);
          let index = -1;
          let annotations = getAnnotations(documentId);
          for (let i = 0, l = annotations.length; i < l; i++) {
            if (annotations[i].uuid === commentId) {
              index = i;
              break;
            }
          }

          if (index > -1) {
            annotations.splice(index, 1);
            updateAnnotations(documentId, annotations);
          }

          resolve(true);
        });
      }

    });
    // resetAnnotations();
//    $(window).on("beforeunload", function (event) {
//      resetAnnotations();
//    });
  }

  addEvent() {
    addEventListener(...arguments);
  }

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

  resetAnnotation(documentId, slient = false) {
    return new Promise((resolve, reject) => {
      updateAnnotations(documentId, []);
      if (!slient) {
        fireEvent('annotation:reset', documentId);
      }
      resolve(true);
    });
  }
}

function getAnnotations(documentId) {
  return JSON.parse(localStorage.getItem(`${documentId}/annotations`)) || [];
}

function updateAnnotations(documentId, annotations) {
  if (annotations.length === 0) {
    localStorage.removeItem(`${documentId}/annotations`);
  } else {
    localStorage.setItem(`${documentId}/annotations`, JSON.stringify(annotations));
  }
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

function resetAnnotations() {
  Object.keys(localStorage).forEach((key) => {
    if (key.indexOf('/annotations') !== -1) {
      localStorage.removeItem(`${key}`);
    }
  });
}
