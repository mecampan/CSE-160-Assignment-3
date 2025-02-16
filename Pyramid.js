class Pyramid {
    constructor() {
        this.type = 'pyramid';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color
        this.matrix = new Matrix4();
        this.buffer = null;
        this.vertexBuffer = null;
        this.uvBuffer = null;
        this.vertices = null;
        this.verts = null;
        this.textureVerts = null;
        this.textureNum = COLOR;
    }

    generateVertices() {
        if (this.vertices === null) {
            this.vertices = [
                // Front Face
                [0,0,0,  0.5,0.5,-0.5,  1,0,0],

                // Left Face
                [0,0,0,  0,0,-1,  0.5,0.5,-0.5],

                // Right Face
                [1,0,0,  1,0,-1,  0.5,0.5,-0.5],

                // Back Face
                [0,0,-1,  1,0,-1,  0.5,0.5,-0.5],

                // Bottom Face
                [0,0,0,  1,0,-1,  1,0,0],
                [0,0,0,  0,0,-1,  1,0,-1]
            ];
        }

        if(this.verts === null) {
            this.cubeVerts = [
                0,0,0,  0.5,0.5,-0.5,  1,0,0,

                0,0,0,  0,0,-1,  0.5,0.5,-0.5,

                1,0,0,  1,0,-1,  0.5,0.5,-0.5,

                0,0,-1,  1,0,-1,  0.5,0.5,-0.5,

                0,0,0,  1,0,-1,  1,0,0,
                0,0,0,  0,0,-1,  1,0,-1
            ];
        }

        if(this.textureVerts === null) {
            this.textureVerts = [
                1,0, 0,1, 0,0,
                1,0, 1,1, 0,1,
        
                0,0, 1,1, 1,0,
                0,0, 1,1, 0,1,        
        
                1,0, 0,1, 0,0,
                1,0, 0,1, 1,1
            ]
        }
    }

    setupBuffer() {
        // Create a buffer object
        if(this.vertexBuffer === null) {
            this.vertexBuffer = gl.createBuffer();
            if (!this.vertexBuffer) {
                console.log('Failed to create the buffer object');
                return -1;
            }
            // Bind the buffer object to target
            gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
            // Write date into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);
            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_Position);
        }
        
        // Create a buffer object for UV
        if(this.uvBuffer === null) {
            this.uvBuffer = gl.createBuffer();
            if (!this.uvBuffer) {
                console.log('Failed to create the uvBuffer object');
                return -1;
            }
            
            // Bind the buffer object to target
            gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
            // Write date into the buffer object
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.textureVerts), gl.DYNAMIC_DRAW);
            // Assign the buffer object to a_Position variable
            gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 0, 0);
            // Enable the assignment to a_Position variable
            gl.enableVertexAttribArray(a_UV);
        }
    }

    render() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to the shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices();
        
        // Front        
        drawTriangle3DUV(this.vertices[0], [1,0, 0,1, 0,0]);

        // Left
        drawTriangle3DUV(this.vertices[1], [0,0, 1,1, 1,0]);     

        // Right
        drawTriangle3DUV(this.vertices[2], [1,0, 0,1, 1,1]);    

        // Back
        drawTriangle3DUV(this.vertices[3], [0,0, 1,1, 1,0]);

        // Bottom
        drawTriangle3DUV(this.vertices[4], [0,0, 1,1, 0,1]);
        drawTriangle3DUV(this.vertices[5], [0,0, 1,1, 0,1]);
    }

    oldRender() {
        var rgba = this.color;

        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices();

        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
                console.log("Failed to create the buffer object");
                return;
            }
        }


        // Draw each face with different shading levels
        gl.uniform4f(u_FragColor, ...faceColors[0]); // Front -Technically considered back due to weird shading
        drawTriangle3D(this.vertices[3], this.buffer);

        gl.uniform4f(u_FragColor, ...faceColors[1]); // Left and Right
        drawTriangle3D(this.vertices[1], this.buffer);
        drawTriangle3D(this.vertices[2], this.buffer);

        gl.uniform4f(u_FragColor, ...faceColors[2]); // Back and Bottom - Back technically considered front due to weird shading
        drawTriangle3D(this.vertices[0], this.buffer);

        drawTriangle3D(this.vertices[4], this.buffer);
        drawTriangle3D(this.vertices[5], this.buffer);
    }
    renderfaster() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to the shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices();
        
        var n = 18; // The number of vertices
        
        this.setupBuffer();
        
        //return n;
        gl.drawArrays(gl.TRIANGLES, 0, n);
    }
}