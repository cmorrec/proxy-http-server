export const responseWrapper = (body: string) => `
<!DOCTYPE html>
<html lang="ru">
    <head>
        <meta charset="UTF-8">
        <title>Катнов, АПО-31</title>
        <style>
         * {
            font-size: 24px;
         }
        </style>
    </head>
    <body>
` + body + `
    </body>
</html>
`;