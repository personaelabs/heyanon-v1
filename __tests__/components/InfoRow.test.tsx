import InfoRow from "../../components/InfoRow";
import { render, screen } from '@testing-library/react';

describe('Testing components/InfoRow', () => {
    it("sets className to className + color if color ", async () => {
        const color = "somecolor";
        const { container } = render(<InfoRow name={"somename"} content={"somecontent"} color={color} />);
        const span = container.getElementsByClassName(`font-bold ${color}`);
        const className = container.getElementsByTagName("span")[ 0 ].className;
        expect(className).toEqual(`font-bold ${color}`);
    }); 
});