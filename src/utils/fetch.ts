const FETCH_TIMEOUT = 5000

const delay = 100;

export async function AgoraFetch (input: RequestInfo, init?: RequestInit, retryCount: number = 3): Promise<any> {
  return new Promise((resolve, reject) => {
    const onSuccess = (response: Response) => {
      resolve(response);
    }

    const onError = (error: any) => {
      retryCount--;
      if (retryCount) {
        setTimeout(fetchRequest, delay);
      } else {
        reject(error);
      }
    }

    const rescueError = (error: any) => {
      throw error;
    }

    function fetchRequest() {
      return fetch(input, init)
        .then(onSuccess)
        .catch(onError)
        .catch(rescueError)
    }

    fetchRequest();

    if (FETCH_TIMEOUT) {
      const err = new Error("request timeout")
      setTimeout(reject, FETCH_TIMEOUT, err)
    }
  })
}
