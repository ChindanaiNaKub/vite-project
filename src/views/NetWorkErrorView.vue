<template>
   <div class="network-error">
    <h1>Uh-Oh!</h1>
    <h3>
        It looks like we hit a snag. Please take a breath and
        <a href="#" @click="$router.go(-1)">Click here</a> to try again.
    </h3>
   </div>
</template>