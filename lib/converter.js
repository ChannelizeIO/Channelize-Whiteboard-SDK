import { createWriteStream, existsSync } from 'fs';
import { spawn } from 'child_process';
import { isObject, isString } from 'lodash';

async function convert(inputPath, option) {
  if (!existsSync(inputPath)) {
    throw new Error(`Make sure the source file exist. ${inputPath}`);
  }
  if (isObject(option) && (option.output || option.buffer)) {
    option.format = option.format || 'pdf';
    if (isString(option.output)) {
      return await convertDirectly(inputPath, option);
    } else if (option.buffer) {
      return await convertToBuffer(inputPath, option);
    }
  } else if (isString(option)) {
    return await convertDirectly(inputPath, { output: option, format: 'pdf' });
  }
  throw new Error('Please read README and pass correct params');
}

function convertToBuffer(input, option) {
  return new Promise((resolve, reject) => {
    const stdout = [];
    const stderr = [];
    const unoconv = spawn('unoconv', ['-f', option.format, '--stdout', input]);

    unoconv.on('error', err => {
      if (err.message.indexOf('ENOENT') > -1) {
        console.error('unoconv command not found');
      }
      return reject(err);
    });

    unoconv.stdout.on('data', data => {
      stdout.push(data);
    });

    unoconv.stderr.on('data', data => {
      stderr.push(data);
    });

    unoconv.on('close', code => {
      if (stderr.length) {
        return reject(new Error(Buffer.concat(stderr).toString('utf8')));
      }
      resolve(Buffer.concat(stdout));
    });
  });
}

function convertDirectly(input, option) {
  return new Promise((resolve, reject) => {
    option.format = option.format || 'pdf';
    const stderr = [];
    const writerStream = createWriteStream(option.output);

    const unoconv = spawn('unoconv', ['-f', option.format, '--stdout', input]);

    unoconv.on('error', err => {
      if (err.message.indexOf('ENOENT') > -1) {
        console.error('unoconv command not found');
      }
      return reject(err);
    });

    unoconv.stdout.pipe(writerStream);

    unoconv.stderr.on('data', data => {
      stderr.push(data);
    });

    unoconv.on('close', code => {
      if (stderr.length) {
        return reject(new Error(Buffer.concat(stderr).toString('utf8')));
      }
      resolve(option.output);
    });
  });
}

export { convert };
