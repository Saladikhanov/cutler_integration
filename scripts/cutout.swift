// macOS only. Cuts the person out of a photo (Apple's Vision framework, runs locally, nothing is uploaded) and
// writes a PNG with a transparent background, for the barber pages (the name sits behind the head).
//
//   swiftc -O scripts/cutout.swift -o /tmp/cutout
//   /tmp/cutout docs/brand/barbers-source/ivan.webp docs/brand/barbers-source/ivan-cutout.png
//
// Photos and cutouts are the owner's content: they go into the Studio (Barber > Cutout), not into git.
import Foundation
import Vision
import CoreImage
import ImageIO

let args = CommandLine.arguments
guard args.count == 3 else { print("usage: cut <input> <output.png>"); exit(2) }
let inURL = URL(fileURLWithPath: args[1]), outURL = URL(fileURLWithPath: args[2])
guard let source = CGImageSourceCreateWithURL(inURL as CFURL, nil), let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else { print("cannot read \(args[1])"); exit(1) }
let handler = VNImageRequestHandler(cgImage: image)
let request = VNGenerateForegroundInstanceMaskRequest()
do {
    try handler.perform([request])
    guard let observation = request.results?.first else { print("no person found in \(args[1])"); exit(3) }
    let buffer = try observation.generateMaskedImage(ofInstances: observation.allInstances, from: handler, croppedToInstancesExtent: false)
    let ci = CIImage(cvPixelBuffer: buffer)
    try CIContext().writePNGRepresentation(of: ci, to: outURL, format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
    print("ok \(outURL.lastPathComponent) \(Int(ci.extent.width))x\(Int(ci.extent.height))")
} catch { print("failed: \(error)"); exit(1) }
