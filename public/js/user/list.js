$(document).ready(function() {

  $("#newUserBtn").click(function() {
    window.location.href = "/admin/organization/" + orgId + "/user/new";
  });

  $(".js-user .js-viewUserBtn").click(function() {
    var orgId = $(this).parents(".js-user").data("orgId");
    var userId = $(this).parents(".js-user").data("userId");
    window.location.href = "/admin/organization/" + orgId + "/user/" + userId;
  });

  $(".js-user .js-editUserBtn").click(function() {
    var orgId = $(this).parents(".js-user").data("orgId");
    var userId = $(this).parents(".js-user").data("userId");
    window.location.href = "/admin/organization/" + orgId + "/user/" + userId + "/edit";
  });

  $(".js-user .js-delUserBtn").click(function() {
    if (confirm("Are you sure to delete this user?")) {
      var orgId = $(this).parents(".js-user").data("orgId");
      var userId = $(this).parents(".js-user").data("userId");
      $.post('/admin/organization/' + orgId + "/user/" + userId, {_method: 'delete'}, function(result) {
        if (result.success) {
          window.location.href = "/admin/organization/" + orgId;
        } else {
          alert("delete failed");
        }
      });
    }
  });

});