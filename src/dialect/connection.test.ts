import { expect } from 'chai';
import { createConnection } from '../path_to_your_connection_module';

describe('Connection Tests', () => {
    let connection;

    beforeEach(async () => {
        connection = await createConnection();
    });

    afterEach(async () => {
        await connection.close();
    });

    it('should connect successfully', async () => {
        await expect(connection.connect()).to.eventually.be.fulfilled;
    });

    it('should throw an error for invalid connection parameters', async () => {
        const invalidConnection = createConnection({ /* invalid params */ });
        await expect(invalidConnection.connect()).to.be.rejectedWith('Invalid connection parameters');
    });

    it('should execute a query successfully', async () => {
        const result = await connection.query('SELECT * FROM users');
        expect(result).to.be.an('array');
    });

    it('should yield rows correctly for streamQuery method', async () => {
        const results = [];
        const queryStreamMock = jest.fn().mockReturnValue({
            [Symbol.asyncIterator]() {
                let index = 0;
                return {
                    next() {
                        if (index < 3) {
                            return Promise.resolve({ value: { id: index, name: `User${index}` }, done: false });
                        }
                        return Promise.resolve({ done: true });
                    },
                };
                index++;
            }
        });

        connection.queryStream = queryStreamMock;

        for await (const row of connection.streamQuery('SELECT * FROM users')) {
            results.push(row);
        }

        expect(results).to.deep.equal([
            { id: 0, name: 'User0' },
            { id: 1, name: 'User1' },
            { id: 2, name: 'User2' }
        ]);
    });
});
