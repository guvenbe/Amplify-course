//it you use TS, you can have types for events. They are present in the package @types/aws-lambda
// import { APIGatewayProxyEvent } from 'aws-lambda'

/**
 * 
 * @param {APIGatewayProxyEvent} event 
 */
export const handler = async (event) => {
    if (isAdmin(event)){
        return {
            statusCode: 200,
            body: JSON.stringify('Oh Amin my admin!'),
        };
    }
    return {
        statusCode: 403,
        body: JSON.stringify('Forbidden, you are not an Admin!!!'),
    };
};

function isAdmin(event){
    const groups = event.requestContext.authorizer?.claims['cognito:groups'];
    if (groups) {
        return (groups).includes('admins');
    }
    return false;
}
