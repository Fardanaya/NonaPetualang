import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@/lib/supabase/server";

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function DELETE(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            console.error('DELETE /api/tools/image - Unauthorized access attempt');
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const { publicId, type, id } = await request.json();
        if (!publicId) {
            console.error('DELETE /api/tools/image - Missing publicId');
            return NextResponse.json(
                { success: false, error: "Missing publicId" },
                { status: 400 }
            );
        }

        if (!type || !["transaction", "profile", "catalog", "assets", "addons", "payment_methods", "accessory"].includes(type)) {
            return NextResponse.json(
                { success: false, error: "Invalid or missing type parameter" },
                { status: 400 }
            );
        }

        if (type !== "assets" && !id) {
            return NextResponse.json(
                { success: false, error: "Missing id parameter for this type" },
                { status: 400 }
            );
        }

        const folderPath = type === "assets" || type === "addons" || type === "expedition" || type === "payment_methods" || type === "accessory"
            ? type
            : `${type}/${id}`;

        console.log(`DELETE /api/tools/image - Deleting image with publicId: ${publicId} from folder: ${folderPath}`);
        const result = await cloudinary.uploader.destroy(`${folderPath}/${publicId}`, {
            invalidate: true
        });

        if (result.result !== 'ok') {
            console.error(`DELETE /api/tools/image - Cloudinary deletion failed: ${result.result}`);
            throw new Error(result.result);
        }

        console.log(`DELETE /api/tools/image - Successfully deleted image: ${publicId}`);
        return NextResponse.json({
            success: true,
            publicId
        });
    } catch (error) {
        console.error('DELETE /api/tools/image - Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : "Delete failed",
                details: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const supabase = await createClient();
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
            return NextResponse.json(
                { success: false, error: "Unauthorized" },
                { status: 401 }
            );
        }

        const formData = await request.formData();
        const files = formData.getAll("files") as File[];
        const type = formData.get("type") as string;
        const id = formData.get("id") as string;

        if (!type || !["transaction", "profile", "catalog", "assets", "addons", "payment_methods", "accessory"].includes(type)) {
            return NextResponse.json(
                { success: false, error: "Invalid or missing type parameter" },
                { status: 400 }
            );
        }

        if (type !== "assets" && !id) {
            return NextResponse.json(
                { success: false, error: "Missing id parameter for this type" },
                { status: 400 }
            );
        }

        const folderPath = type === "assets" || type === "addons" || type === "expedition" || type === "payment_methods" || type === "accessory"
            ? type
            : `${type}/${id}`;

        const uploadResults = await Promise.all(
            files.map(async (file) => {
                const arrayBuffer = await file.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);

                return new Promise<any>((resolve, reject) => {
                    cloudinary.uploader.upload_stream(
                        { folder: folderPath },
                        (error, result) => {
                            if (error) return reject(error);
                            resolve({
                                url: result?.secure_url,
                                publicId: result?.public_id
                            });
                        }
                    ).end(buffer);
                });
            })
        );

        return NextResponse.json({
            success: true,
            results: uploadResults
        });
    } catch (error) {
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Upload failed" },
            { status: 500 }
        );
    }
}
