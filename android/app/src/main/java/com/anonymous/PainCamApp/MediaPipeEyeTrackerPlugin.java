package com.anonymous.PainCamApp;

import android.content.Context;
import android.media.Image;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.ImageFormat;
import android.graphics.Rect;
import android.graphics.YuvImage;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import com.mrousavy.camera.frameprocessors.Frame;
import com.mrousavy.camera.frameprocessors.FrameProcessorPlugin;
import com.mrousavy.camera.core.FrameInvalidError;

import com.google.mediapipe.framework.image.MPImage;
import com.google.mediapipe.framework.image.BitmapImageBuilder; // <-- Usaremos este constructor ahora
import com.google.mediapipe.tasks.core.BaseOptions;
import com.google.mediapipe.tasks.core.Delegate;
import com.google.mediapipe.tasks.vision.core.RunningMode;
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarker;
import com.google.mediapipe.tasks.vision.facelandmarker.FaceLandmarkerResult;
import com.google.mediapipe.tasks.components.containers.Category;

import java.io.ByteArrayOutputStream;
import java.nio.ByteBuffer;
import java.util.Map;
import java.util.HashMap;
import java.util.List;

public class MediaPipeEyeTrackerPlugin extends FrameProcessorPlugin {
    
    private FaceLandmarker faceLandmarker = null;
    private static final String TAG = "EyeTrackerPlugin";

    public MediaPipeEyeTrackerPlugin(Context context) {
        super();
        setupMediaPipe(context);
    }

    private void setupMediaPipe(Context context) {
        if (faceLandmarker != null) return;
        try {
            BaseOptions baseOptions = BaseOptions.builder()
                .setModelAssetPath("face_landmarker.task")
                .setDelegate(Delegate.CPU) 
                .build();

            FaceLandmarker.FaceLandmarkerOptions options = FaceLandmarker.FaceLandmarkerOptions.builder()
                .setBaseOptions(baseOptions)
                .setRunningMode(RunningMode.IMAGE) 
                .setNumFaces(1) 
                .setOutputFaceBlendshapes(true) 
                .build();

            faceLandmarker = FaceLandmarker.createFromOptions(context, options);
            Log.d(TAG, "MediaPipe inicializado correctamente");
        } catch (Exception e) {
            Log.e(TAG, "Error al inicializar MediaPipe", e);
        }
    }

    // --- MAGIA: Convertidor de YUV crudo a Bitmap (ARGB_8888) ---
    private Bitmap toBitmap(Image image) {
        ByteBuffer yBuffer = image.getPlanes()[0].getBuffer();
        ByteBuffer uBuffer = image.getPlanes()[1].getBuffer();
        ByteBuffer vBuffer = image.getPlanes()[2].getBuffer();

        int ySize = yBuffer.remaining();
        int uSize = uBuffer.remaining();
        int vSize = vBuffer.remaining();

        byte[] nv21 = new byte[ySize + uSize + vSize];
        yBuffer.get(nv21, 0, ySize);
        vBuffer.get(nv21, ySize, vSize);
        uBuffer.get(nv21, ySize + vSize, uSize);

        YuvImage yuvImage = new YuvImage(nv21, ImageFormat.NV21, image.getWidth(), image.getHeight(), null);
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        yuvImage.compressToJpeg(new Rect(0, 0, image.getWidth(), image.getHeight()), 90, out);
        byte[] imageBytes = out.toByteArray();
        
        return BitmapFactory.decodeByteArray(imageBytes, 0, imageBytes.length);
    }

    @Nullable
    @Override
    public Object callback(@NonNull Frame frame, @Nullable Map<String, Object> arguments) {
        Map<String, Object> result = new HashMap<>();

        if (faceLandmarker == null) {
            result.put("error", "IA_NO_INICIALIZADA");
            return result;
        }

        try {
            Image mediaImage = frame.getImage();
            if (mediaImage == null) {
                result.put("error", "IMAGEN_NULA");
                return result;
            }

            // 1. Traducimos la imagen manualmente usando nuestra nueva función
            Bitmap bitmap = toBitmap(mediaImage);
            
            // 2. Usamos el constructor de Bitmap (que es automáticamente ARGB_8888)
            MPImage mpImage = new BitmapImageBuilder(bitmap).build();
            
            FaceLandmarkerResult landmarkerResult = faceLandmarker.detect(mpImage);

            if (!landmarkerResult.faceBlendshapes().isPresent() || landmarkerResult.faceBlendshapes().get().isEmpty()) {
                result.put("status", "NO_HAY_CARA");
                return result;
            }

            List<Category> blendshapes = landmarkerResult.faceBlendshapes().get().get(0);
            for (Category category : blendshapes) {
                if (category.categoryName().equals("eyeBlinkLeft")) {
                    result.put("blinkLeft", (double) category.score());
                }
                if (category.categoryName().equals("eyeBlinkRight")) {
                    result.put("blinkRight", (double) category.score());
                }
            }

        } catch (FrameInvalidError e) {
            result.put("error", "FRAME_INVALID");
        } catch (Exception e) {
            result.put("error", "EXCEPCION_INTERNA: " + e.getMessage());
        }

        return result;
    }
}