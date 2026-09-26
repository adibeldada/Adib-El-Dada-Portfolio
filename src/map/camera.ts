// where the camera goes. every section of the page has a "shot" (a camera position + the
// point it looks at). as you scroll between two sections, the camera glides between their shots.

import * as THREE from 'three';
import { heightAt, smoothstep, WIDTH, DEPTH } from './terrain';

export interface Shot {
	pos: THREE.Vector3;
	look: THREE.Vector3;
}

// look at `subject` from `direction`, `distance` away. then slide the whole shot sideways so the
// subject lands on one side of the screen, leaving room for the text on the other side.
// on phones the text sits at the bottom, so the subject gets pushed up instead
export function frameShot(
	subject: THREE.Vector3,
	direction: THREE.Vector3,
	distance: number,
	place: 'left' | 'right' | 'center',
	camera: THREE.PerspectiveCamera,
): Shot {
	const pos = subject.clone().addScaledVector(direction.clone().normalize(), distance);
	const look = subject.clone();

	const forward = look.clone().sub(pos).normalize();
	const right = new THREE.Vector3().crossVectors(forward, camera.up).normalize();
	const up = new THREE.Vector3().crossVectors(right, forward);
	const halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
	const halfWidth = halfHeight * camera.aspect;

	const shift = new THREE.Vector3();
	if (camera.aspect < 0.9) shift.addScaledVector(up, -0.4 * halfHeight);
	else if (place === 'left') shift.addScaledVector(right, 0.36 * halfWidth);
	else if (place === 'right') shift.addScaledVector(right, -0.38 * halfWidth);
	pos.add(shift);
	look.add(shift);
	return { pos, look };
}

// blend from shot a to shot b. f goes 0 → 1 as you scroll between the two sections.
// the easing holds still near each end, so the camera parks on a stop while you read its card
export function blendShots(a: Shot, b: Shot, f: number, out: Shot) {
	const e = smoothstep(0.2, 0.8, f);
	out.pos.lerpVectors(a.pos, b.pos, e);
	out.look.lerpVectors(a.look, b.look, e);
	out.pos.y += Math.sin(Math.PI * e) * 0.9; // swoop up a little on the way, instead of sliding
	// and never dip into the hills
	const gx = THREE.MathUtils.clamp(out.pos.x, -WIDTH / 2, WIDTH / 2);
	const gz = THREE.MathUtils.clamp(out.pos.z, -DEPTH / 2, DEPTH / 2);
	out.pos.y = Math.max(out.pos.y, heightAt(gx, gz) + 1);
	return e;
}
