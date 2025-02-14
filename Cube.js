class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color
        this.matrix = new Matrix4();
        this.buffer = null;
        this.vertices = null;
        this.cubeVerts = null;
        this.textureNum = -2;
    }

    generateVertices() {
        if (this.vertices === null) {
            this.vertices = [
                // Front Face
                [0,0,0, 1,1,0, 1,0,0],
                [0,0,0, 0,1,0, 1,1,0],

                // Top Face
                [0,1,0, 1,1,-1, 0,1,-1],
                [0,1,0, 1,1,-1, 1,1,0],

                // Left Face
                [0,0,-1, 0,1,0, 0,0,0],
                [0,0,-1, 0,1,0, 0,1,-1],

                // Right Face
                [1,0,-1, 1,1,0, 1,0,0],
                [1,0,-1, 1,1,0, 1,1,-1],

                // Back Face
                [0,0,-1, 1,1,-1, 1,0,-1],
                [0,0,-1, 0,1,-1, 1,1,-1],

                // Bottom Face
                [0,0,0, 1,0,-1, 1,0,0],
                [0,0,0, 0,0,-1, 1,0,-1]
            ];
        }
        if(this.cubeVerts === null) {
            this.cubeVerts = [
                0,0,0,  1,1,0,  1,0,0,
                0,0,0,  0,1,0,  1,1,0,

                0,1,0, 1,1,-1, 0,1,-1,
                0,1,0, 1,1,-1, 1,1,0,

                0,0,-1, 0,1,0, 0,0,0,
                0,0,-1, 0,1,0, 0,1,-1,

                1,0,-1, 1,1,0, 1,0,0,
                1,0,-1, 1,1,0, 1,1,-1,

                0,0,-1, 1,1,-1, 1,0,-1,
                0,0,-1, 0,1,-1, 1,1,-1,

                0,0,0, 1,0,-1, 1,0,0,
                0,0,0, 0,0,-1, 1,0,-1
            ];
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
        drawTriangle3DUV(this.vertices[1], [1,0, 1,1, 0,1]);

        // Top
        drawTriangle3DUV(this.vertices[2], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vertices[3], [0,0, 1,1, 0,1]);        

        // Left
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3DUV(this.vertices[4], [1,0, 0,1, 0,0]);
        drawTriangle3DUV(this.vertices[5], [1,0, 0,1, 1,1]);    

        // Right
        drawTriangle3DUV(this.vertices[6], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vertices[7], [0,0, 1,1, 0,1]);
        
        // Back
        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        drawTriangle3DUV(this.vertices[8], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vertices[9], [0,0, 0,1, 1,1]);

        // Bottom
        drawTriangle3DUV(this.vertices[10], [0,0, 1,1, 1,0]);
        drawTriangle3DUV(this.vertices[11], [0,0, 0,1, 1,1]);
    }

    renderfast() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to the shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices();

        drawTriangle3DUV(this.cubeVerts);      
    }

    renderfaster() {
        var rgba = this.color;

        // Pass the texture number
        gl.uniform1i(u_whichTexture, this.textureNum);

        // Pass the matrix to the shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Pass the matrix to u_ModelMatrix attribute
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        if(g_vertexBuffer == null){
            initTriangle3D();
        }

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.cubeVerts), gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 3);   
    }
}

/*
class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0]; // Default color
        this.matrix = new Matrix4();
        this.buffer = null;
        this.vertices = null;
    }

    generateVertices() {
        if (this.vertices === null) {
            this.vertices = [
                // Front Face
                [0,0,0, 1,1,0, 1,0,0],
                [0,0,0, 0,1,0, 1,1,0],

                // Top Face
                [0,1,0, 1,1,-1, 1,1,0],
                [0,1,0, 0,1,-1, 1,1,-1],

                // Left Face
                [0,0,0, 0,1,0, 0,0,-1],
                [0,0,-1, 0,1,0, 0,1,-1],

                // Right Face
                [1,0,0, 1,1,0, 1,0,-1],
                [1,0,-1, 1,1,0, 1,1,-1],

                // Back Face
                [0,0,-1, 1,1,-1, 1,0,-1],
                [0,0,-1, 0,1,-1, 1,1,-1],

                // Bottom Face
                [0,0,0, 1,0,-1, 1,0,0],
                [0,0,0, 0,0,-1, 1,0,-1]
            ];
        }
    }

    setupBuffer() {
        // Create and reuse buffer
        if (this.buffer === null) {
            this.buffer = gl.createBuffer();
            if (!this.buffer) {
                console.log("Failed to create the buffer object");
                return;
            }
        }
    }

    render() {
        var rgba = this.color;

        // Pass the matrix to the shader
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        this.generateVertices();
        this.setupBuffer();

        // Front        
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
        drawTriangle3DUV( [this.vertices[0]], [1,0, 0,1, 1,1]);
        drawTriangle3D(this.vertices[1], this.buffer);

        // Top
        drawTriangle3D(this.vertices[2], this.buffer);
        drawTriangle3D(this.vertices[3], this.buffer);

        // Left
        gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
        drawTriangle3D(this.vertices[4], this.buffer);
        drawTriangle3D(this.vertices[5], this.buffer);

        // Right
        drawTriangle3D(this.vertices[6], this.buffer);
        drawTriangle3D(this.vertices[7], this.buffer);  
        
        // Back
        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        drawTriangle3D(this.vertices[8], this.buffer);
        drawTriangle3D(this.vertices[9], this.buffer);

        // Bottom
        drawTriangle3D(this.vertices[10], this.buffer);
        drawTriangle3D(this.vertices[11], this.buffer);  
    }
}
*/