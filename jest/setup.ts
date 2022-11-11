import { TextEncoder, TextDecoder } from "util";
/**
 * @dev neccessary setup for node-fetch to work properly
 * 1. Had to downgrade node-fetch to 2.6.7
 * 2. Need to setup TextEncoder and TextDecoder
 * see:
 * - https://github.com/jsdom/whatwg-url/issues/209
 * - https://github.com/node-fetch/node-fetch/discussions/1503
 * For now, avoid to provide additional flags when running tests
 */
global.TextEncoder = TextEncoder;
//@ts-ignore
global.TextDecoder = TextDecoder;

/**
 * @dev a polyfill for mocking fetch 
 */
require('jest-fetch-mock').enableMocks()

declare global {
    interface Window {
        ethereum: null | any;
    }
}